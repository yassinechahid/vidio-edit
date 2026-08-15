Build a **professional, modern video editing web application** inspired by the workflow quality of tools like CapCut, Adobe Premiere Pro, DaVinci Resolve, and Canva Video — but create an **original UI and implementation**, not a copy.

## Tech Stack

Use:

* Next.js with App Router
* TypeScript
* Tailwind CSS
* React
* Lucide React for icons
* Existing components from `/components` whenever appropriate
* HTML5 Video API
* Canvas API where useful
* Web Audio API for audio visualization/volume
* FFmpeg.wasm only where actual media processing/export requires it

Do not unnecessarily install libraries if the functionality can be implemented cleanly with the existing stack.

The application must be:

* Fully responsive
* Professional
* Fast
* Modular
* Scalable
* Accessible
* Production-quality
* Well organized

---

# 1. Main Editor Layout

Create a professional dark video-editing workspace.

The editor should contain:

### Top Bar

Include:

* App logo/name
* Project name
* Undo
* Redo
* Autosave status
* Aspect ratio selector
* Resolution selector
* Export button

Example resolutions:

* 720p
* 1080p
* 1440p
* 4K

Aspect ratios:

* 16:9
* 9:16
* 1:1
* 4:5
* 21:9

---

# 2. Left Sidebar

Create a vertical tool navigation with:

* Media
* Audio
* Text
* Captions
* Stickers
* Shapes
* Transitions
* Effects
* Filters
* Adjustments
* Templates

Clicking a tool should change the content of the adjacent panel.

Do not make these buttons decorative. Implement their state and interaction properly.

---

# 3. Media Library

Allow users to import:

* MP4
* WebM
* MOV where browser support permits
* MP3
* WAV
* PNG
* JPG
* WebP

Support:

* File picker
* Drag and drop
* Multiple uploads

Display uploaded assets in a professional media grid.

For videos show:

* Thumbnail
* Filename
* Duration

For images show a thumbnail.

For audio show:

* Filename
* Duration
* Audio icon/waveform where possible

Users should be able to drag assets from the media library onto the timeline.

---

# 4. Video Preview

The center of the application should contain the video preview/canvas.

Include:

* Play
* Pause
* Previous frame
* Next frame
* Current time
* Total duration
* Volume
* Mute
* Zoom
* Fullscreen

The preview must stay synchronized with the timeline playhead.

Users should be able to select visual elements directly from the preview.

Selected elements should show a bounding box with handles.

Allow:

* Move
* Resize
* Rotate

for supported visual layers.

---

# 5. Timeline

The timeline is one of the most important parts of the application.

Make it feel like a real professional editor.

Create:

* Time ruler
* Playhead
* Video tracks
* Audio tracks
* Text tracks
* Overlay tracks
* Timeline zoom
* Horizontal scrolling

Example:

V2 — overlays / text
V1 — main video
A1 — original audio
A2 — music / voiceover

Timeline clips should visually represent their duration.

Video clips should display thumbnail frames where practical.

Audio clips should display a waveform where practical.

---

# 6. Timeline Interactions

Implement real editing interactions.

Users should be able to:

* Select clips
* Drag clips
* Reorder clips
* Move clips between compatible tracks
* Trim from the left
* Trim from the right
* Split at playhead
* Delete
* Duplicate
* Copy
* Paste
* Multi-select
* Zoom timeline
* Snap clips together
* Move the playhead
* Seek video by clicking the timeline

Add keyboard shortcuts:

Space → Play/Pause

Delete/Backspace → Delete selected clip

Ctrl/Cmd + Z → Undo

Ctrl/Cmd + Shift + Z → Redo

Ctrl/Cmd + C → Copy

Ctrl/Cmd + V → Paste

Ctrl/Cmd + D → Duplicate

S → Split selected clip at playhead

---

# 7. Clip Inspector

When a clip is selected, show a properties/inspector panel on the right.

For video/image layers provide:

## Transform

* Position X
* Position Y
* Scale
* Width
* Height
* Rotation
* Opacity

## Video

* Playback speed
* Volume
* Fade in
* Fade out

## Adjustments

* Exposure
* Brightness
* Contrast
* Saturation
* Temperature
* Tint
* Highlights
* Shadows
* Blur

Include reset controls.

Changes should update the preview immediately.

---

# 8. Text Editor

Users should be able to add text layers.

Provide:

* Text content
* Font
* Font size
* Font weight
* Alignment
* Text color
* Background color
* Opacity
* Letter spacing
* Line height
* Stroke
* Shadow
* Position
* Rotation

Provide text presets such as:

* Title
* Subtitle
* Heading
* Caption
* Lower third

Text elements must appear as clips on the timeline so their duration can be changed.

---

# 9. Transitions

Create a transition system.

Include examples such as:

* Fade
* Dissolve
* Slide
* Wipe
* Zoom

Allow the transition duration to be changed.

Design the architecture so additional transitions can easily be added later.

---

# 10. Audio Editing

Provide basic audio editing.

Include:

* Volume
* Mute
* Fade in
* Fade out
* Trim
* Split
* Duplicate
* Playback synchronization

Display audio waveforms when possible.

Create separate tracks for:

* Original video audio
* Music
* Voiceover

---

# 11. Captions

Create a captions/subtitles system.

Users should be able to:

* Add captions manually
* Edit caption text
* Set start/end time
* Change caption style
* Change position
* Change font
* Change size
* Change color
* Change background

Prepare the architecture so automatic speech-to-text can be connected later through an API.

Do NOT fake AI transcription.

---

# 12. Undo / Redo

Create a proper editor history system.

Important actions should be reversible, including:

* Moving clips
* Trimming
* Splitting
* Deleting
* Adding elements
* Transform changes
* Text changes
* Effect changes

Use a clean command/history architecture rather than scattered state hacks.

---

# 13. Project State

Create a strongly typed project model.

For example, the project should conceptually contain:

* Project metadata
* Canvas settings
* Media assets
* Tracks
* Timeline clips
* Text layers
* Effects
* Transitions
* Audio settings

Each timeline item should have a unique ID.

Keep the architecture ready for future database persistence.

Do not tightly couple editor state to the UI components.

---

# 14. Autosave

Implement local project autosaving using IndexedDB or another appropriate browser persistence mechanism.

Show states such as:

Saving...

Saved

Unsaved changes

The user should not lose the entire project after refreshing the browser.

---

# 15. Export

Create a professional Export modal.

Options:

### Resolution

* 720p
* 1080p
* 1440p
* 4K where technically feasible

### Frame rate

* 24 FPS
* 25 FPS
* 30 FPS
* 60 FPS

### Format

Support only formats that the implemented browser/FFmpeg pipeline can actually generate.

Show:

* Estimated settings
* Export progress
* Processing state
* Completion state
* Error state

Do not create fake export functionality.

If a requested export feature cannot be implemented entirely in the browser, structure the code so a backend rendering service can be connected later and clearly document that boundary.

---

# 16. Responsive Design

Desktop should provide the complete professional editing experience.

Tablet should intelligently collapse panels.

On smaller screens:

* Use drawers for side panels
* Keep the preview usable
* Make the timeline horizontally scrollable
* Keep playback controls accessible

Do not simply shrink the desktop interface until it becomes unusable.

---

# 17. UI / UX

The interface should look like a premium professional creative application.

Use:

* Dark neutral workspace
* Clear hierarchy
* Subtle borders
* Appropriate spacing
* Compact professional controls
* Tooltips
* Dropdowns
* Context menus
* Sliders
* Smooth transitions
* Clear selected/hover/focus states

Avoid:

* Huge cards
* Excessive rounded corners
* Excessive gradients
* Decorative dashboards
* Oversized typography
* Random colors
* Excessive empty space

This is an editing workspace, not a marketing landing page.

Prioritize information density while keeping the interface clean.

---

# 18. Component Architecture

Do not put the entire editor inside one component.

Create reusable modules similar to:

`components/editor/EditorShell`

`components/editor/TopBar`

`components/editor/ToolSidebar`

`components/editor/MediaPanel`

`components/editor/PreviewCanvas`

`components/editor/PlaybackControls`

`components/editor/Timeline`

`components/editor/TimelineTrack`

`components/editor/TimelineClip`

`components/editor/Playhead`

`components/editor/Inspector`

`components/editor/TextEditor`

`components/editor/AudioEditor`

`components/editor/ExportModal`

`components/editor/ContextMenu`

Also separate:

* hooks
* types
* utilities
* editor state
* media utilities
* timeline calculations
* export logic

Use the project's existing folder conventions if they are already established.

---

# 19. Code Quality

Use strict TypeScript.

Avoid `any` unless absolutely unavoidable.

Keep components reasonably small.

Extract complicated logic into hooks and utilities.

Do not duplicate logic.

Do not use hardcoded sample behavior when real functionality can be implemented.

Avoid hydration errors.

Avoid unnecessary client components.

Clean up:

* object URLs
* event listeners
* media resources
* workers

when they are no longer needed.

---

# 20. Performance

Video editing can become expensive.

Optimize accordingly.

Use:

* Memoization where beneficial
* Efficient timeline rendering
* RequestAnimationFrame for playback synchronization
* Lazy loading
* Efficient state selectors
* Object URLs for local media
* Virtualization if the timeline/media library becomes large

Do not cause the entire editor to rerender every time the playhead changes.

Separate high-frequency playback state from low-frequency project state.

---

# 21. Important Rule: Real Functionality

Do not build a visual mockup where buttons do nothing.

Prioritize working functionality.

Every visible important control should either:

1. Work, or
2. Be clearly marked as unavailable/not implemented.

Never pretend an AI feature, cloud feature, rendering operation, transcription system, or media-processing feature works when there is no implementation behind it.

---

# 22. Development Strategy

Do NOT attempt to build the entire application as one giant change.

First inspect the existing repository.

Identify:

* Current Next.js version
* Existing components
* Existing dependencies
* Existing styles
* Existing project structure

Reuse existing components where appropriate.

Then implement the editor incrementally.

### Phase 1

Build:

* Editor shell
* Responsive layout
* Media import
* Video preview
* Basic playback
* Basic timeline
* Playhead synchronization

Make sure Phase 1 works before continuing.

### Phase 2

Implement:

* Timeline drag/drop
* Trimming
* Splitting
* Delete
* Duplicate
* Multiple tracks
* Undo/redo

### Phase 3

Implement:

* Text layers
* Transform controls
* Inspector
* Audio controls
* Effects/adjustments

### Phase 4

Implement:

* Transitions
* Captions
* Project persistence
* Export pipeline

### Phase 5

Polish:

* Performance
* Keyboard shortcuts
* Context menus
* Accessibility
* Responsive behavior
* Error handling
* Empty states
* Loading states

After every phase:

1. Run TypeScript checks.
2. Run linting.
3. Run the production build.
4. Fix errors before proceeding.
5. Test the functionality already implemented.

---

# Final Requirement

I want this to become a **real professional video editor**, not merely a beautiful frontend demonstration.

Think through the architecture before writing code.

Start by inspecting the repository and proposing the file structure and implementation architecture. Then begin with Phase 1.

Preserve existing working functionality and avoid rewriting unrelated files.
