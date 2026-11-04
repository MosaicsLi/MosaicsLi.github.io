// 影音工具的轉檔邏輯：用 ffmpeg.wasm 在瀏覽器裡跑 FFmpeg，檔案不會上傳到任何地方
// 文件：https://ffmpegwasm.netlify.app/docs/overview
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
// 轉檔引擎跟著網站一起建置、從自己的網域載入（不依賴外部 CDN）
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

let ffmpeg: FFmpeg | null = null;

export type Progress = (ratio: number) => void;

/** 第一次使用時才下載轉檔引擎（約 30MB），之後重複使用同一個 */
async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (!ffmpeg) {
    const instance = new FFmpeg();
    await instance.load({ coreURL, wasmURL });
    ffmpeg = instance;
  }
  ffmpeg.off('log', logHandler);
  logHandler = ({ message }) => onLog?.(message);
  ffmpeg.on('log', logHandler);
  return ffmpeg;
}
let logHandler: (e: { message: string }) => void = () => {};

/** 執行一次 FFmpeg 指令，回傳輸出檔；結束後清掉虛擬檔案系統裡的暫存檔 */
async function run(
  inputs: { name: string; file: File }[],
  args: string[],
  output: string,
  mime: string,
  onProgress?: Progress,
  onLog?: (msg: string) => void,
): Promise<Blob> {
  const ff = await getFFmpeg(onLog);
  const progressHandler = ({ progress }: { progress: number }) =>
    onProgress?.(Math.min(1, Math.max(0, progress)));
  ff.on('progress', progressHandler);
  try {
    for (const { name, file } of inputs) {
      await ff.writeFile(name, await fetchFile(file));
    }
    const code = await ff.exec(args);
    if (code !== 0) throw new Error(`FFmpeg 結束代碼 ${code}，請看下方紀錄`);
    const data = await ff.readFile(output);
    if (typeof data === 'string') throw new Error('輸出格式錯誤');
    return new Blob([data as BlobPart], { type: mime });
  } finally {
    ff.off('progress', progressHandler);
    for (const name of [...inputs.map((i) => i.name), output]) {
      await ff.deleteFile(name).catch(() => {});
    }
  }
}

/** 取副檔名（含點），沒有就回傳預設值 */
function ext(file: File, fallback: string): string {
  const m = /\.[a-z0-9]+$/i.exec(file.name);
  return m ? m[0].toLowerCase() : fallback;
}

/** 影片轉 MP3：丟掉影像，聲音用 LAME 編成 VBR（品質約 190kbps） */
export function videoToMp3(video: File, onProgress?: Progress, onLog?: (msg: string) => void) {
  const input = `input${ext(video, '.mp4')}`;
  return run(
    [{ name: input, file: video }],
    ['-i', input, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', 'output.mp3'],
    'output.mp3',
    'audio/mpeg',
    onProgress,
    onLog,
  );
}

/**
 * 把音訊合成進影片：影像直接複製（不重新編碼，所以很快），
 * 聲音換成上傳的音訊並轉成 AAC。shortest = 以比較短的一方為準裁切。
 */
export function mergeAudioVideo(
  video: File,
  audio: File,
  shortest: boolean,
  onProgress?: Progress,
  onLog?: (msg: string) => void,
) {
  const v = `video${ext(video, '.mp4')}`;
  const a = `audio${ext(audio, '.mp3')}`;
  const args = ['-i', v, '-i', a, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k'];
  if (shortest) args.push('-shortest');
  args.push('output.mp4');
  return run(
    [
      { name: v, file: video },
      { name: a, file: audio },
    ],
    args,
    'output.mp4',
    'video/mp4',
    onProgress,
    onLog,
  );
}

/** 把原始檔名換成新的副檔名，例如 trip.mp4 → trip.mp3 */
export function renameTo(file: File, newExt: string, suffix = ''): string {
  const base = file.name.replace(/\.[^.]+$/, '') || 'output';
  return `${base}${suffix}${newExt}`;
}
