import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const useFFmpeg = () => {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            setProgress(Math.round(progress * 100));
        });

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
        } catch (err) {
            console.error('Failed to load FFmpeg:', err);
        }
    };

    const processVideo = async (file: File) => {
        if (!loaded) return null;

        setIsProcessing(true);
        setProgress(0);
        const ffmpeg = ffmpegRef.current;

        try {
            const inputName = 'input.mp4';
            const outputName = 'output.mp4';

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            /**
             * The Math:
             * Panel 1: 512x256
             * Panel 2: 512x256
             * Panel 3: 256x256
             * Total: 1280x256
             * 
             * We'll create 3 separate scales/crops from the same source to fill these panels.
             */
            const filter = [
                '[0:v]scale=512:256:force_original_aspect_ratio=increase,crop=512:256[p1];',
                '[0:v]scale=512:256:force_original_aspect_ratio=increase,crop=512:256[p2];',
                '[0:v]scale=256:256:force_original_aspect_ratio=decrease,pad=256:256:(ow-iw)/2:(oh-ih)/2:black[p3];',
                '[p1][p2][p3]hstack=inputs=3[v]'
            ].join(' ');

            await ffmpeg.exec([
                '-i', inputName,
                '-filter_complex', filter,
                '-map', '[v]',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '28',
                outputName
            ]);

            const data = await ffmpeg.readFile(outputName);
            const blobData = typeof data === 'string'
                ? new TextEncoder().encode(data)
                : new Uint8Array(data);
            const blob = new Blob([blobData], { type: 'video/mp4' });

            // Cleanup
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            return blob;
        } catch (error) {
            console.error('Error processing video:', error);
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return {
        loaded,
        progress,
        isProcessing,
        processVideo,
    };
};
