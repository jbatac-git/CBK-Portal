<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\LearningMaterial;
use App\Services\Materials\SecureFileStreamer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LearningMaterialStreamController extends Controller
{
    public function __invoke(Request $request, LearningMaterial $learningMaterial, SecureFileStreamer $streamer): Response
    {
        // Checked HERE, on the actual byte-serving request — not only when
        // the listing/show page was rendered. This is what stops a saved
        // or guessed stream URL from bypassing the temporary-access lock.
        $this->authorize('view', $learningMaterial);

        // Link videos have no stored bytes to serve.
        abort_if($learningMaterial->isExternalLink() || ! $learningMaterial->file_path, 404);

        return $streamer->stream($request, $learningMaterial);
    }
}
