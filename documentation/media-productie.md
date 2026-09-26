# Documentation media production

The checked-in media must be reproducible without real case data.

## User-guide capture

1. Start the GUI:

   ```sh
   pnpm --dir packages/gui dev --host 127.0.0.1 --port 3498
   ```

2. Use a 1440×900 browser viewport and the Dutch public starter library.
3. Capture, in order:
   - the home page;
   - the `Phishing en betaalfraude` viewer;
   - the script editor without changing content;
   - the empty LLM brief;
   - a prompt generated from synthetic values, in light theme;
   - deterministic synthetic JSON pasted into PAX;
   - PAX's local validation preview before import.
4. Save the PNG files as `01-home.png` through
   `07-llm-review.png` in `documentation/assets/user-guide/`. The JSON example
   must validate in the current wizard. Do not imply that a specific LLM
   generated it unless that interaction was genuinely captured.
5. Generate the silent WebM slideshow:

   ```sh
   printf "file '%s'\nduration 3\n" \
     "$PWD/documentation/assets/user-guide/01-home.png" \
     "$PWD/documentation/assets/user-guide/02-script-view.png" \
     "$PWD/documentation/assets/user-guide/03-script-edit.png" \
     "$PWD/documentation/assets/user-guide/04-llm-brief.png" \
     "$PWD/documentation/assets/user-guide/05-llm-prompt-light.png" \
     "$PWD/documentation/assets/user-guide/06-llm-json-paste.png" \
     "$PWD/documentation/assets/user-guide/07-llm-review.png" \
     > /tmp/pax-user-guide-concat.txt
   printf "file '%s'\n" \
     "$PWD/documentation/assets/user-guide/07-llm-review.png" \
     >> /tmp/pax-user-guide-concat.txt
   ffmpeg -y -f concat -safe 0 -i /tmp/pax-user-guide-concat.txt \
     -vf "fps=24,scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p" \
     -c:v libvpx-vp9 -crf 36 -b:v 0 -an \
     documentation/assets/user-guide/pax-handleiding.webm
   rm /tmp/pax-user-guide-concat.txt
   ```
6. Keep `documentation/assets/user-guide/pax-handleiding.nl.vtt` aligned with
   the seven three-second slides. The final validation slide remains visible
   until 24 seconds. The in-app guide uses these timestamps for both captions
   and seekable steps.

## Publication checks

- Verify every control name against the current Dutch interface.
- Open every relative link from `documentation/handleiding.nl.md`.
- Check the WebM with `ffprobe`.
- Open the in-app guide and verify that Dutch captions are enabled by default,
  every step seeks to the matching slide, and the captions remain legible in
  light and dark themes.
- Ensure screenshots contain no restricted content, local paths, credentials,
  browser history, notifications, or personal bookmarks.
