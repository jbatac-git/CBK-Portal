<?php

namespace Tests\Feature\Settings;

use App\Enums\PriceListFileType;
use App\Enums\RoleName;
use App\Models\Company;
use App\Models\PriceList;
use App\Models\PriceListDownload;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class PriceListDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        Storage::fake('local');
    }

    public function test_admin_can_upload_an_excel_price_list(): void
    {
        $this->actingAs($this->userWithRole(RoleName::Admin))->post(route('admin.price-lists.store'), [
            'title' => 'Hardware Prices',
            'status' => 'active',
            'file' => UploadedFile::fake()->createWithContent('prices.xlsx', $this->workbookBytes()),
        ])->assertSessionHasNoErrors()->assertSessionMissing('error');

        $priceList = PriceList::firstOrFail();
        $this->assertSame(PriceListFileType::Excel, $priceList->fileType());
        $this->assertStringEndsWith('.xlsx', $priceList->file_path);
        Storage::disk('local')->assertExists($priceList->file_path);
    }

    public function test_rejects_a_zip_file_renamed_to_xlsx(): void
    {
        $zip = $this->zipBytes(['notes.txt' => 'not a workbook']);

        $this->actingAs($this->userWithRole(RoleName::Admin))->post(route('admin.price-lists.store'), [
            'title' => 'Renamed zip',
            'status' => 'active',
            'file' => UploadedFile::fake()->createWithContent('prices.xlsx', $zip),
        ])->assertSessionHas('error');

        $this->assertSame(0, PriceList::count());
    }

    public function test_diser_downloads_an_excel_copy_stamped_with_their_name_and_the_download_is_logged(): void
    {
        $diser = $this->diser(['first_name' => 'Juan', 'middle_name' => null, 'last_name' => 'Dela Peña']);
        $priceList = $this->excelPriceList();
        $original = Storage::disk('local')->get($priceList->file_path);

        $response = $this->actingAs($diser)->get(route('portal.price-lists.file', $priceList));

        $response->assertOk()->assertDownload('hardware-prices.xlsx');

        $download = PriceListDownload::sole();
        $this->assertSame($diser->id, $download->user_id);
        $this->assertSame('Juan Dela Peña', $download->user_name);
        $this->assertSame($priceList->id, $download->price_list_id);

        $zip = $this->openDownloadedWorkbook($response->baseResponse->getFile()->getPathname());
        $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');

        $this->assertStringContainsString('CBK-001', $sheet, 'Cell data must be untouched.');
        $this->assertStringContainsString("Downloaded by Juan Dela Peña (@{$diser->username})", $sheet);
        $this->assertStringContainsString("Ref {$download->id}", $sheet);
        $this->assertStringContainsString('<picture r:id="rIdCbkDownloadStamp"/>', $sheet);
        $this->assertNotFalse($zip->locateName('xl/media/cbk-download-stamp.png'));
        $this->assertStringContainsString('image/png', $zip->getFromName('[Content_Types].xml'));
        $this->assertStringContainsString($diser->username, $zip->getFromName('docProps/core.xml'));
        $zip->close();

        // The stored original is never modified.
        $this->assertSame($original, Storage::disk('local')->get($priceList->file_path));
    }

    public function test_diser_opens_a_pdf_price_list_in_the_browser_and_it_is_logged(): void
    {
        $diser = $this->diser();
        $priceList = PriceList::factory()->create(['title' => 'June Prices']);
        Storage::disk('local')->put($priceList->file_path, "%PDF-1.4\n%%EOF");

        $this->actingAs($diser)
            ->get(route('portal.price-lists.file', $priceList))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('Content-Disposition', 'inline; filename=june-prices.pdf');

        $this->assertSame(1, PriceListDownload::where('user_id', $diser->id)->count());
    }

    public function test_diser_cannot_open_an_archived_price_list(): void
    {
        $priceList = $this->excelPriceList(['status' => 'archived']);

        $this->actingAs($this->diser())->get(route('portal.price-lists.file', $priceList))->assertForbidden();

        $this->assertSame(0, PriceListDownload::count());
    }

    public function test_diser_without_the_price_list_module_cannot_open_files(): void
    {
        $diser = $this->userWithRole(RoleName::Diser);

        $this->actingAs($diser)->get(route('portal.price-lists.file', $this->excelPriceList()))->assertForbidden();
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get(route('portal.price-lists.file', $this->excelPriceList()))->assertRedirect(route('login'));
    }

    public function test_admin_can_open_an_archived_price_list(): void
    {
        $priceList = $this->excelPriceList(['status' => 'archived']);

        $this->actingAs($this->userWithRole(RoleName::Admin))
            ->get(route('admin.price-lists.file', $priceList))
            ->assertOk()
            ->assertDownload();
    }

    public function test_price_list_pages_link_to_the_logged_in_file_route(): void
    {
        $priceList = $this->excelPriceList();

        $this->actingAs($this->diser())
            ->get(route('portal.price-lists.index'))
            ->assertInertia(fn ($page) => $page
                ->where('priceLists.0.file_url', route('portal.price-lists.file', $priceList))
                ->where('priceLists.0.file_type', 'xlsx'));
    }

    private function userWithRole(RoleName $role, array $attributes = []): User
    {
        $user = User::factory()->create(['company_id' => Company::factory(), ...$attributes]);
        $user->assignRole($role->value);

        return $user;
    }

    private function diser(array $attributes = []): User
    {
        $diser = $this->userWithRole(RoleName::Diser, $attributes);
        $diser->givePermissionTo('portal.price-lists');

        return $diser;
    }

    private function excelPriceList(array $attributes = []): PriceList
    {
        $priceList = PriceList::factory()->create([
            'title' => 'Hardware Prices',
            'file_path' => 'price-lists/hardware.xlsx',
            'mime_type' => PriceListFileType::Excel->value,
            ...$attributes,
        ]);
        Storage::disk('local')->put($priceList->file_path, $this->workbookBytes());

        return $priceList;
    }

    private function openDownloadedWorkbook(string $path): ZipArchive
    {
        $copy = tempnam(sys_get_temp_dir(), 'test-xlsx-');
        copy($path, $copy);
        @unlink($path);

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($copy));
        $this->beforeApplicationDestroyed(fn () => @unlink($copy));

        return $zip;
    }

    /** The smallest .xlsx Excel opens: one sheet with one text cell. */
    private function workbookBytes(): string
    {
        $main = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
        $rel = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
        $pkg = 'http://schemas.openxmlformats.org/package/2006/relationships';

        return $this->zipBytes([
            '[Content_Types].xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                .'<Default Extension="xml" ContentType="application/xml"/>'
                .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
                .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                .'<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
                .'</Types>',
            '_rels/.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                ."<Relationships xmlns=\"{$pkg}\">"
                ."<Relationship Id=\"rId1\" Type=\"{$rel}/officeDocument\" Target=\"xl/workbook.xml\"/>"
                .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
                .'</Relationships>',
            'docProps/core.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                .'<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">'
                .'<dc:creator>CBK</dc:creator></cp:coreProperties>',
            'xl/workbook.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                ."<workbook xmlns=\"{$main}\" xmlns:r=\"{$rel}\"><sheets><sheet name=\"Prices\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>",
            'xl/_rels/workbook.xml.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                ."<Relationships xmlns=\"{$pkg}\"><Relationship Id=\"rId1\" Type=\"{$rel}/worksheet\" Target=\"worksheets/sheet1.xml\"/></Relationships>",
            'xl/worksheets/sheet1.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                ."<worksheet xmlns=\"{$main}\" xmlns:r=\"{$rel}\"><sheetData>"
                .'<row r="1"><c r="A1" t="inlineStr"><is><t>CBK-001</t></is></c></row>'
                .'</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>',
        ]);
    }

    /** @param  array<string, string>  $entries */
    private function zipBytes(array $entries): string
    {
        $path = tempnam(sys_get_temp_dir(), 'test-zip-');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::OVERWRITE);

        foreach ($entries as $name => $contents) {
            $zip->addFromString($name, $contents);
        }

        $zip->close();
        $bytes = (string) file_get_contents($path);
        unlink($path);

        return $bytes;
    }
}
