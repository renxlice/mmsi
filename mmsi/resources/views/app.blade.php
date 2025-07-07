<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MMSI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- ✅ Google Fonts --}}
    <link href="https://fonts.googleapis.com/css2?family=Headland+One&family=Lexend&display=swap" rel="stylesheet" />

    {{-- ✅ Ambil data dari manifest.json --}}
    @php
        $manifestPath = public_path('panel/build/.vite/manifest.json');
        $manifest = file_exists($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : null;
        $entry = $manifest['resources/ts/main.tsx'] ?? null;
    @endphp

    @if ($entry && isset($entry['css'][0]))
        <link rel="stylesheet" href="{{ asset('panel/build/' . $entry['css'][0]) }}">
    @endif
</head>
<body class="bg-gray-100 text-gray-800">
    <div id="root"></div>

    @if ($entry && isset($entry['file']))
        <script type="module" src="{{ asset('panel/build/' . $entry['file']) }}"></script>
    @else
        <p style="color:red;text-align:center;">Vite build not found. Please run <code>npm run build</code>.</p>
    @endif
</body>
</html>
