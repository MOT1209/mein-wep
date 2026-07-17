"""
KING2 Video Editor Module
AI-Powered Video Montage System
MLT/Shotcut Style Framework
"""

import os
import json
import subprocess
import tempfile
import shutil
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import cv2
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp_videos")
os.makedirs(TEMP_DIR, exist_ok=True)


class AudioWaveformAnalyzer:
    def __init__(self):
        self.sample_rate = 44100
    
    def extract_audio(self, video_path: str, output_path: str = None) -> str:
        if not output_path:
            output_path = os.path.join(TEMP_DIR, f"audio_{int(datetime.now().timestamp())}.wav")
        
        cmd = [
            "ffmpeg", "-i", video_path,
            "-vn", "-acodec", "pcm_s16le",
            "-ar", str(self.sample_rate), "-ac", "1",
            "-y", output_path
        ]
        subprocess.run(cmd, capture_output=True, timeout=120)
        return output_path
    
    def analyze_waveform(self, audio_path: str) -> Dict:
        try:
            import wave
            with wave.open(audio_path, 'r') as wf:
                frames = wf.readframes(wf.getnframes())
                samples = np.frombuffer(frames, dtype=np.int16)
                samples = samples.astype(np.float32) / 32768.0
                
                window_size = self.sample_rate // 10
                energies = []
                for i in range(0, len(samples), window_size):
                    window = samples[i:i+window_size]
                    energy = np.sqrt(np.mean(window**2))
                    energies.append(energy)
                
                return {
                    "duration": len(samples) / self.sample_rate,
                    "peaks": self._find_peaks(energies),
                    "silence_threshold": np.mean(energies) * 0.1,
                    "avg_energy": np.mean(energies)
                }
        except:
            return {"duration": 0, "peaks": [], "silence_threshold": 0}
    
    def _find_peaks(self, energies: List[float], threshold: float = 0.5) -> List[int]:
        peaks = []
        mean_energy = np.mean(energies)
        for i, e in enumerate(energies):
            if e > mean_energy * (1 + threshold):
                if i > 0 and i < len(energies) - 1:
                    if energies[i] > energies[i-1] and energies[i] > energies[i+1]:
                        peaks.append(i)
        return peaks[:50]
    
    def detect_bpm(self, audio_path: str) -> int:
        try:
            import wave
            with wave.open(audio_path, 'r') as wf:
                frames = wf.readframes(wf.getnframes())
                samples = np.frombuffer(frames, dtype=np.int16).astype(np.float32)
                samples = samples[::100]
                
                autocorr = np.correlate(samples, samples, mode='full')
                autocorr = autocorr[len(autocorr)//2:]
                
                min_lag = int(self.sample_rate / 200)
                max_lag = int(self.sample_rate / 60)
                
                peak_idx = np.argmax(autocorr[min_lag:max_lag]) + min_lag
                bpm = int(60 * self.sample_rate / peak_idx)
                
                return max(60, min(200, bpm))
        except:
            return 120
    
    def find_silence_regions(self, audio_path: str, threshold: float = 0.02) -> List[Tuple[float, float]]:
        try:
            import wave
            with wave.open(audio_path, 'r') as wf:
                frames = wf.readframes(wf.getnframes())
                samples = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
                
                window_size = self.sample_rate // 20
                silence_regions = []
                start = None
                
                for i in range(0, len(samples), window_size):
                    window = samples[i:i+window_size]
                    energy = np.sqrt(np.mean(window**2))
                    
                    if energy < threshold:
                        if start is None:
                            start = i / self.sample_rate
                    else:
                        if start is not None:
                            end = i / self.sample_rate
                            if end - start > 0.3:
                                silence_regions.append((start, end))
                            start = None
                
                return silence_regions
        except:
            return []


class VideoProcessor:
    def __init__(self):
        self.ffmpeg_path = "ffmpeg"
        self.ffprobe_path = "ffprobe"
    
    def get_video_info(self, video_path: str) -> Dict:
        try:
            cmd = [
                self.ffprobe_path, "-v", "quiet",
                "-print_format", "json",
                "-show_format", "-show_streams",
                video_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            data = json.loads(result.stdout)
            
            video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
            audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
            
            return {
                "duration": float(data.get("format", {}).get("duration", 0)),
                "width": video_stream.get("width", 0) if video_stream else 0,
                "height": video_stream.get("height", 0) if video_stream else 0,
                "fps": self._parse_fps(video_stream.get("r_frame_rate", "0/1")) if video_stream else 0,
                "codec": video_stream.get("codec_name", "unknown") if video_stream else "unknown",
                "has_audio": audio_stream is not None,
                "size_mb": float(data.get("format", {}).get("size", 0)) / (1024 * 1024)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _parse_fps(self, fps_str: str) -> float:
        try:
            num, den = fps_str.split("/")
            return int(num) / int(den)
        except:
            return 0.0
    
    def extract_frames(self, video_path: str, output_dir: str, interval: int = 1) -> List[str]:
        os.makedirs(output_dir, exist_ok=True)
        frames = []
        
        cap = cv2.VideoCapture(video_path)
        frame_idx = 0
        saved_idx = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % interval == 0:
                frame_path = os.path.join(output_dir, f"frame_{saved_idx:05d}.jpg")
                cv2.imwrite(frame_path, frame)
                frames.append(frame_path)
                saved_idx += 1
            
            frame_idx += 1
        
        cap.release()
        return frames
    
    def create_timeline(self, video_paths: List[str], transitions: List[str] = None) -> Dict:
        timeline = {
            "tracks": [],
            "duration": 0,
            "clips": []
        }
        
        for idx, video_path in enumerate(video_paths):
            info = self.get_video_info(video_path)
            clip = {
                "id": idx,
                "source": video_path,
                "start": timeline["duration"],
                "duration": info.get("duration", 0),
                "transition": transitions[idx] if transitions and idx < len(transitions) else "cut"
            }
            timeline["clips"].append(clip)
            timeline["duration"] += info.get("duration", 0)
        
        return timeline
    
    def render_video(self, timeline: Dict, output_path: str, preset: str = "fast") -> bool:
        try:
            cmd = [self.ffmpeg_path]
            for clip in timeline["clips"]:
                cmd.extend(["-i", clip['source']])
            cmd.extend(["-c:v", "libx264", "-preset", preset, "-y", output_path])

            subprocess.run(
                cmd,
                capture_output=True, timeout=3600
            )
            return True
        except Exception as e:
            print(f"[VideoEditor] Render error: {e}")
            return False


class SceneDetector:
    def __init__(self):
        self.threshold = 30.0
    
    def detect_scenes(self, video_path: str) -> List[Dict]:
        scenes = []
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            return scenes
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = 0
        prev_frame = None
        scene_start = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if prev_frame is not None:
                diff = cv2.absdiff(gray, prev_frame)
                mean_diff = np.mean(diff)
                
                if mean_diff > self.threshold:
                    scenes.append({
                        "start": scene_start / fps,
                        "end": frame_count / fps,
                        "frame_start": scene_start,
                        "frame_end": frame_count
                    })
                    scene_start = frame_count
            
            prev_frame = gray
            frame_count += 1
        
        scenes.append({
            "start": scene_start / fps,
            "end": frame_count / fps,
            "frame_start": scene_start,
            "frame_end": frame_count
        })
        
        cap.release()
        return scenes


class AudioAnalyzer:
    def __init__(self):
        pass
    
    def analyze_audio(self, video_path: str) -> Dict:
        try:
            import subprocess
            cmd = [
                "ffmpeg", "-i", video_path,
                "-af", "volumedetect",
                "-f", "null", "-"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            output = result.stderr
            max_vol = 0
            mean_vol = 0
            
            for line in output.split("\n"):
                if "max_volume" in line:
                    max_vol = float(line.split(":")[-1].strip().replace(" dB", ""))
                if "mean_volume" in line:
                    mean_vol = float(line.split(":")[-1].strip().replace(" dB", ""))
            
            return {
                "max_volume": max_vol,
                "mean_volume": mean_vol,
                "has_audio": max_vol != 0
            }
        except:
            return {"has_audio": False}


class EDLExporter:
    def __init__(self):
        self.events = []
    
    def add_event(self, clip_id: int, source_in: float, source_out: float, record_in: float, transition: str = "C"):
        self.events.append({
            "clip_id": clip_id,
            "source_in": source_in,
            "source_out": source_out,
            "record_in": record_in,
            "transition": transition
        })
    
    def export(self) -> str:
        edl = "TITLE: KING2 Montage\nFCM: NON-DROP FRAME\n\n"
        for event in self.events:
            clip_id = event["clip_id"]
            rec_in = event["record_in"]
            rec_out = rec_in + (event["source_out"] - event["source_in"])
            src_in = event["source_in"]
            src_out = event["source_out"]
            
            edl += f"{clip_id:03d}  V     C        {self._timecode(rec_in)} {self._timecode(rec_out)} {self._timecode(src_in)} {self._timecode(src_out)}\n"
            edl += f"* FROM CLIP NAME: CLIP_{clip_id}\n\n"
        
        return edl
    
    def _timecode(self, seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        frames = int((seconds % 1) * 30)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}:{frames:02d}"


class MLTXMLExporter:
    def __init__(self):
        self.producers = []
        self.filters = []
        self.playlists = []
    
    def add_producer(self, id: str, file_path: str, duration: float):
        self.producers.append({
            "id": id,
            "file": file_path,
            "duration": int(duration * 25)
        })
    
    def add_playlist(self, playlist_id: str, entries: List[Dict]):
        self.playlists.append({
            "id": playlist_id,
            "entries": entries
        })
    
    def export(self) -> str:
        xml = '<?xml version="1.0"?>\n'
        xml += '<mlt profile="hdv_720p_50" version="7.22.0">\n'
        
        for p in self.producers:
            xml += f'  <producer id="{p["id"]}" in="0" out="{p["duration"]}">\n'
            xml += f'    <property name="resource">{p["file"]}</property>\n'
            xml += '  </producer>\n'
        
        xml += '  <playlist id="playlist0">\n'
        for pl in self.playlists:
            for entry in pl["entries"]:
                xml += f'    <entry producer="{entry["producer"]}" in="{entry["in"]}" out="{entry["out"]}"/>\n'
        xml += '  </playlist>\n'
        
        xml += '  <tractor id="main" multitrack="0">\n'
        xml += '    <track producer="playlist0"/>\n'
        xml += '  </tractor>\n'
        xml += '</mlt>'
        
        return xml


class SmartMontageEngine:
    def __init__(self):
        self.waveform_analyzer = AudioWaveformAnalyzer()
        self.scene_detector = SceneDetector()
        self.edl_exporter = EDLExporter()
        self.mlt_exporter = MLTXMLExporter()
    
    def generate_montage_map(self, video_paths: List[str], music_path: str = None) -> Dict:
        timeline = {
            "version": "1.0",
            "generated": datetime.now().isoformat(),
            "videos": [],
            "transitions": [],
            "total_duration": 0
        }
        
        for idx, video_path in enumerate(video_paths):
            audio_path = self.waveform_analyzer.extract_audio(video_path)
            waveform = self.waveform_analyzer.analyze_waveform(audio_path)
            bpm = self.waveform_analyzer.detect_bpm(audio_path)
            silence_regions = self.waveform_analyzer.find_silence_regions(audio_path)
            scenes = self.scene_detector.detect_scenes(video_path)
            
            video_info = {
                "index": idx,
                "path": video_path,
                "scenes": scenes,
                "bpm": bpm,
                "silence_regions": silence_regions,
                "waveform_peaks": waveform.get("peaks", []),
                "duration": 0
            }
            
            for scene in scenes:
                video_info["duration"] = max(video_info["duration"], scene["end"])
            
            timeline["videos"].append(video_info)
            timeline["total_duration"] += video_info["duration"]
        
        if music_path:
            music_audio = self.waveform_analyzer.extract_audio(music_path)
            timeline["music_bpm"] = self.waveform_analyzer.detect_bpm(music_audio)
            timeline["audio_sync"] = self._calculate_audio_sync(timeline)
        
        timeline["edl"] = self._generate_edl(timeline)
        timeline["mlt_xml"] = self._generate_mlt(timeline)
        
        return timeline
    
    def _calculate_audio_sync(self, timeline: Dict) -> Dict:
        return {
            "beat_markers": [],
            "transition_points": [],
            "method": "bpm_alignment"
        }
    
    def _generate_edl(self, timeline: Dict) -> str:
        self.edl_exporter = EDLExporter()
        record_time = 0.0
        
        for video in timeline["videos"]:
            for scene in video["scenes"]:
                self.edl_exporter.add_event(
                    clip_id=video["index"],
                    source_in=scene["start"],
                    source_out=scene["end"],
                    record_in=record_time,
                    transition="C"
                )
                record_time += (scene["end"] - scene["start"])
        
        return self.edl_exporter.export()
    
    def _generate_mlt(self, timeline: Dict) -> str:
        self.mlt_exporter = MLTXMLExporter()
        
        for video in timeline["videos"]:
            self.mlt_exporter.add_producer(f"video_{video['index']}", video["path"], video["duration"])
        
        entries = []
        for video in timeline["videos"]:
            entries.append({
                "producer": f"video_{video['index']}",
                "in": 0,
                "out": int(video["duration"] * 25)
            })
        
        self.mlt_exporter.add_playlist("main", entries)
        return self.mlt_exporter.export()


class MontageEngine:
    def __init__(self):
        self.video_processor = VideoProcessor()
        self.scene_detector = SceneDetector()
        self.audio_analyzer = AudioAnalyzer()
    
    def auto_generate_montage(self, video_paths: List[str], style: str = "cinematic") -> Dict:
        timeline = self.video_processor.create_timeline(video_paths)
        
        all_scenes = []
        for video in video_paths:
            scenes = self.scene_detector.detect_scenes(video)
            all_scenes.extend(scenes)
        
        result = {
            "style": style,
            "total_videos": len(video_paths),
            "total_duration": timeline["duration"],
            "scenes_detected": len(all_scenes),
            "timeline": timeline,
            "status": "ready"
        }
        
        return result
    
    def smart_cut(self, video_path: str, beat_timestamps: List[float]) -> List[Dict]:
        scenes = self.scene_detector.detect_scenes(video_path)
        cuts = []
        
        for beat in beat_timestamps:
            for scene in scenes:
                if scene["start"] <= beat <= scene["end"]:
                    cuts.append({
                        "timestamp": beat,
                        "scene_start": scene["start"],
                        "scene_end": scene["end"],
                        "type": "beat_match"
                    })
                    break
        
        return cuts


class VideoEditor:
    def __init__(self):
        self.engine = MontageEngine()
        self.current_project = None
    
    def create_project(self, name: str) -> Dict:
        project = {
            "name": name,
            "created": datetime.now().isoformat(),
            "videos": [],
            "timeline": None,
            "output": None
        }
        self.current_project = project
        return project
    
    def add_video(self, video_path: str) -> Dict:
        if not self.current_project:
            return {"error": "Create project first"}
        
        info = self.video_processor.get_video_info(video_path)
        info["path"] = video_path
        self.current_project["videos"].append(info)
        return info
    
    def generate_preview(self, output_path: str) -> bool:
        if not self.current_project:
            return False
        
        timeline = self.video_processor.create_timeline(
            [v["path"] for v in self.current_project["videos"]]
        )
        return self.video_processor.render_video(timeline, output_path)
    
    def get_project_status(self) -> Dict:
        if not self.current_project:
            return {"status": "no_project"}
        return {
            "name": self.current_project["name"],
            "videos_count": len(self.current_project["videos"]),
            "status": "editing"
        }


_video_editor = None

def get_video_editor() -> VideoEditor:
    global _video_editor
    if _video_editor is None:
        _video_editor = VideoEditor()
    return _video_editor