export class ImageLoader {
    async load(url) {
        return loadImageBitmap(url);
    }
}

export async function loadImageBitmap(url) {
    const blob = await fetch(url).then((response) => response.blob());
    // Allow loading svgs
    if (blob.type.includes("svg")) {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await img.decode();
        URL.revokeObjectURL(img.src);
        return await createImageBitmap(img);
    } else {
        return await createImageBitmap(blob);
    }
}
