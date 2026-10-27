<?php

namespace App\Services\PriceLists;

use DOMDocument;
use DOMElement;
use Illuminate\Support\Str;
use RuntimeException;
use ZipArchive;

/**
 * Stamps a copy of an .xlsx workbook with who downloaded it, so a shared copy
 * can be traced back to the account. The stamp goes into:
 *  - every worksheet's background (a faint tiled image, visible in Normal view),
 *  - every worksheet's printed footer (left section),
 *  - the file's Comments property.
 *
 * Cell data, formulas and formatting are never touched. Uses only the zip and
 * gd extensions: an .xlsx file is a zip of XML parts.
 */
class ExcelDownloadStamper
{
    private const MAIN_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

    private const RELATIONSHIPS_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

    private const PACKAGE_RELATIONSHIPS_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';

    private const CONTENT_TYPES_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';

    private const DUBLIN_CORE_NS = 'http://purl.org/dc/elements/1.1/';

    private const IMAGE_PATH = 'xl/media/cbk-download-stamp.png';

    private const RELATIONSHIP_ID = 'rIdCbkDownloadStamp';

    /** Excel rejects header/footer text longer than this. */
    private const MAX_FOOTER_LENGTH = 255;

    /** Worksheet children that must come after <picture> (ECMA-376 CT_Worksheet order). */
    private const AFTER_PICTURE = ['oleObjects', 'controls', 'webPublishItems', 'tableParts', 'extLst'];

    /** Worksheet children that must come after <headerFooter>. */
    private const AFTER_HEADER_FOOTER = [
        'rowBreaks', 'colBreaks', 'customProperties', 'cellWatches', 'ignoredErrors', 'smartTags',
        'drawing', 'legacyDrawing', 'legacyDrawingHF', 'drawingHF', 'picture', ...self::AFTER_PICTURE,
    ];

    /** Whether the file is a plain .xlsx workbook (not macro-enabled, not a template, not encrypted). */
    public function isWorkbook(string $path): bool
    {
        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            return false;
        }

        $contentTypes = $zip->getFromName('[Content_Types].xml');
        $isWorkbook = $zip->locateName('xl/workbook.xml') !== false
            && is_string($contentTypes)
            && str_contains($contentTypes, 'spreadsheetml.sheet.main+xml');

        $zip->close();

        return $isWorkbook;
    }

    /**
     * Writes a stamped copy of the workbook to a temporary file and returns
     * its path. The caller deletes the file once it has been sent.
     *
     * @param  resource  $source  readable stream of the original .xlsx
     * @param  array<int, string>  $lines  stamp text, e.g. [name and username, date and reference]
     */
    public function stamp($source, array $lines): string
    {
        $path = tempnam(sys_get_temp_dir(), 'cbk-xlsx-');
        $target = fopen($path, 'wb');
        stream_copy_to_stream($source, $target);
        fclose($target);

        $zip = new ZipArchive;

        if ($zip->open($path) !== true || $zip->locateName('xl/workbook.xml') === false) {
            @unlink($path);

            throw new RuntimeException('The price list file is not a readable Excel workbook.');
        }

        $text = implode(' · ', $lines);

        $zip->addFromString(self::IMAGE_PATH, $this->tileImage($lines));
        $this->registerPngContentType($zip);

        foreach ($this->worksheetPaths($zip) as $sheetPath) {
            $this->stampWorksheet($zip, $sheetPath, $text);
        }

        $this->stampProperties($zip, $text);

        if (! $zip->close()) {
            @unlink($path);

            throw new RuntimeException('The stamped Excel file could not be written.');
        }

        return $path;
    }

    /** @return array<int, string> */
    private function worksheetPaths(ZipArchive $zip): array
    {
        $paths = [];

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);

            if (preg_match('#^xl/worksheets/[^/]+\.xml$#', $name)) {
                $paths[] = $name;
            }
        }

        return $paths;
    }

    private function stampWorksheet(ZipArchive $zip, string $sheetPath, string $text): void
    {
        $doc = $this->load((string) $zip->getFromName($sheetPath));
        $root = $doc->documentElement;

        $headerFooter = $this->child($root, 'headerFooter')
            ?? $this->insertInOrder($root, $this->element($root, 'headerFooter'), self::AFTER_HEADER_FOOTER);
        $this->stampFooter($headerFooter, $text);

        $picture = $this->child($root, 'picture')
            ?? $this->insertInOrder($root, $this->element($root, 'picture'), self::AFTER_PICTURE);
        $picture->setAttributeNS(self::RELATIONSHIPS_NS, 'r:id', self::RELATIONSHIP_ID);

        $zip->addFromString($sheetPath, $doc->saveXML());
        $this->linkImage($zip, $sheetPath);
    }

    /**
     * Puts the stamp in the footer's left section, or its right section when
     * the sheet already uses the left one. An existing footer is kept as is.
     */
    private function stampFooter(DOMElement $headerFooter, string $text): void
    {
        $stamp = '&8'.str_replace('&', '&&', $text);
        $footer = $this->child($headerFooter, 'oddFooter');

        if (! $footer) {
            $footer = $this->insertInOrder(
                $headerFooter,
                $this->element($headerFooter, 'oddFooter'),
                ['evenHeader', 'evenFooter', 'firstHeader', 'firstFooter'],
            );
        }

        $existing = $footer->textContent;
        $section = match (true) {
            ! str_contains($existing, '&L') => '&L',
            ! str_contains($existing, '&R') => '&R',
            default => null,
        };

        if ($section && mb_strlen($existing.$section.$stamp) <= self::MAX_FOOTER_LENGTH) {
            $footer->textContent = $existing.$section.$stamp;
        }
    }

    /** Adds the image relationship to the worksheet's .rels part, creating the part if needed. */
    private function linkImage(ZipArchive $zip, string $sheetPath): void
    {
        $relsPath = dirname($sheetPath).'/_rels/'.basename($sheetPath).'.rels';
        $xml = $zip->getFromName($relsPath);
        $doc = $this->load(is_string($xml) ? $xml : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="'.self::PACKAGE_RELATIONSHIPS_NS.'"/>');

        foreach (iterator_to_array($doc->documentElement->childNodes) as $node) {
            if ($node instanceof DOMElement && $node->getAttribute('Id') === self::RELATIONSHIP_ID) {
                $doc->documentElement->removeChild($node);
            }
        }

        $relationship = $doc->createElementNS(self::PACKAGE_RELATIONSHIPS_NS, 'Relationship');
        $relationship->setAttribute('Id', self::RELATIONSHIP_ID);
        $relationship->setAttribute('Type', self::RELATIONSHIPS_NS.'/image');
        $relationship->setAttribute('Target', '../media/'.basename(self::IMAGE_PATH));
        $doc->documentElement->appendChild($relationship);

        $zip->addFromString($relsPath, $doc->saveXML());
    }

    private function registerPngContentType(ZipArchive $zip): void
    {
        $doc = $this->load((string) $zip->getFromName('[Content_Types].xml'));

        foreach ($doc->getElementsByTagNameNS(self::CONTENT_TYPES_NS, 'Default') as $default) {
            if (strtolower($default->getAttribute('Extension')) === 'png') {
                return;
            }
        }

        $default = $doc->createElementNS(self::CONTENT_TYPES_NS, 'Default');
        $default->setAttribute('Extension', 'png');
        $default->setAttribute('ContentType', 'image/png');
        $doc->documentElement->insertBefore($default, $doc->documentElement->firstChild);

        $zip->addFromString('[Content_Types].xml', $doc->saveXML());
    }

    private function stampProperties(ZipArchive $zip, string $text): void
    {
        $xml = $zip->getFromName('docProps/core.xml');

        if (! is_string($xml)) {
            return;
        }

        $doc = $this->load($xml);
        $description = $doc->getElementsByTagNameNS(self::DUBLIN_CORE_NS, 'description')->item(0)
            ?? $doc->documentElement->appendChild($doc->createElementNS(self::DUBLIN_CORE_NS, 'dc:description'));
        $description->textContent = $text;

        $zip->addFromString('docProps/core.xml', $doc->saveXML());
    }

    /**
     * A transparent PNG with the stamp lines written at an angle in light
     * grey. Excel repeats it across the sheet. GD's built-in font is ASCII
     * only, so accents are dropped here (the footer keeps the real name).
     *
     * @param  array<int, string>  $lines
     */
    private function tileImage(array $lines): string
    {
        $font = 5;
        $scale = 2;
        $lineGap = 6;
        $lines = array_map(fn (string $line) => Str::ascii(str_replace('·', '-', $line)), $lines);

        $width = max(array_map('strlen', $lines)) * imagefontwidth($font);
        $height = count($lines) * (imagefontheight($font) + $lineGap) - $lineGap;

        $text = $this->transparentCanvas($width, $height);
        $grey = imagecolorallocatealpha($text, 110, 110, 110, 88);

        foreach ($lines as $i => $line) {
            imagestring($text, $font, 0, $i * (imagefontheight($font) + $lineGap), $line, $grey);
        }

        $scaled = imagescale($text, $width * $scale, $height * $scale, IMG_NEAREST_NEIGHBOUR);
        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);
        // Smoothing would tint the transparent area around the text into a visible box.
        imagesetinterpolation($scaled, IMG_NEAREST_NEIGHBOUR);

        $rotated = imagerotate($scaled, 20, imagecolorallocatealpha($scaled, 0, 0, 0, 127));
        imagesavealpha($rotated, true);

        // Padding spaces the repeated tiles apart.
        $tile = $this->transparentCanvas(imagesx($rotated) + 160, imagesy($rotated) + 140);
        imagealphablending($tile, true);
        imagecopy($tile, $rotated, 80, 70, 0, 0, imagesx($rotated), imagesy($rotated));
        imagealphablending($tile, false);

        ob_start();
        imagepng($tile);

        return (string) ob_get_clean();
    }

    private function transparentCanvas(int $width, int $height): \GdImage
    {
        $image = imagecreatetruecolor(max(1, $width), max(1, $height));
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 0, 0, 127));

        return $image;
    }

    private function load(string $xml): DOMDocument
    {
        $doc = new DOMDocument;

        if ($xml === '' || ! $doc->loadXML($xml, LIBXML_PARSEHUGE | LIBXML_NONET)) {
            throw new RuntimeException('The price list file contains a part that is not valid XML.');
        }

        return $doc;
    }

    /** A new element in the parent's namespace and prefix, so prefixed files (x:worksheet) stay valid. */
    private function element(DOMElement $parent, string $name): DOMElement
    {
        $namespace = $parent->namespaceURI ?? self::MAIN_NS;
        $qualified = $parent->prefix ? "{$parent->prefix}:{$name}" : $name;

        return $parent->ownerDocument->createElementNS($namespace, $qualified);
    }

    private function child(DOMElement $parent, string $name): ?DOMElement
    {
        foreach ($parent->childNodes as $node) {
            if ($node instanceof DOMElement && $node->localName === $name) {
                return $node;
            }
        }

        return null;
    }

    /**
     * Inserts the element before the first existing child that the schema
     * requires to come after it, or at the end when there is none.
     *
     * @param  array<int, string>  $laterSiblings
     */
    private function insertInOrder(DOMElement $parent, DOMElement $element, array $laterSiblings): DOMElement
    {
        foreach ($parent->childNodes as $node) {
            if ($node instanceof DOMElement && in_array($node->localName, $laterSiblings, true)) {
                return $parent->insertBefore($element, $node);
            }
        }

        return $parent->appendChild($element);
    }
}
