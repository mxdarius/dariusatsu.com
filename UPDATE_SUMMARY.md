# Website Updates - Pressure Effects & Time-Aware Theme

## Changes Implemented

### 1. Font Update ✓

- **Changed from:** "Druk Wide Bold"
- **Changed to:** "Cocogoose Pro Bold Italic"
- **Location:** `/public/fonts/Cocogoose-Pro-Bold-Italic-trial.ttf`
- **Note:** Added fallback to a web font until the TTF file is placed in the fonts directory

### 2. Inverse Time-Aware Theme ✓

- **Night (6pm - 6am):** White background, Black text
- **Day (6am - 6pm):** Black background, White text
- **Current time:** 2:00 AM (Night) → Using **white background & black text**
- Theme updates automatically every minute

### 3. React Text Pressure Effect ✓

Implemented advanced cursor-reactive effects on "DARIUS ATSU":

#### Features:

- **Scale Effect:** Characters scale from 1.0x to 1.3x based on cursor proximity
- **Blur Effect:** Characters blur from 0px to 8px on edges based on distance
- **Smooth Transitions:** 0.1s ease-out for natural feel
- **Performance:** Uses `requestAnimationFrame` via React state for smooth 60fps

#### Technical Implementation:

- Tracks cursor position in real-time
- Calculates distance from cursor to each character
- Maximum influence distance: 300px
- Supports both mouse and pointer events (for stylus/touch with pressure)
- Enhanced pressure sensitivity for devices that support PointerEvent API

### 4. Shape Blur on Edges ✓

- Characters farther from cursor have minimal blur
- Characters closer to cursor get progressive blur (up to 8px)
- Creates a depth effect where focus follows the cursor
- Edge characters blur more dramatically creating a "soft focus" effect

## File Changes

### `/src/App.tsx`

- Added cursor position tracking state
- Added character pressure state management
- Implemented `renderPressureText()` function for dynamic text rendering
- Added mouse/pointer event listeners for real-time tracking
- Each character now renders with individual scale and blur transforms
- Updated theme logic to inverse (night=light, day=dark)

### `/src/index.css`

- Updated `@font-face` to use Cocogoose Pro
- Maintained fallback font for loading states
- Kept existing theme CSS variables (work correctly with new logic)

### `/public/fonts/`

- Created fonts directory
- Added README with instructions for font file placement

## How It Works

### Pressure Effect Algorithm:

```
1. Track cursor position (x, y)
2. For each character:
   a. Get character center position
   b. Calculate distance from cursor
   c. Normalize distance (0-300px range)
   d. Calculate scale: 1 + (1 - normalizedDistance) * 0.3
   e. Calculate blur: (1 - normalizedDistance) * 8
   f. Apply transforms with smooth transition
```

### Pointer Pressure Support:

If using a stylus or touch device with pressure sensitivity:

- Actual pressure value (0.0 - 1.0) multiplies the effect
- Creates even more dramatic scale (up to 1.5x with full pressure)
- Blur can reach up to 12px with full pressure

## Testing

- Server running at: http://localhost:5173/
- Demo recording created showing the pressure effects
- All existing features (split-flap animation, particles, links) remain functional

## Next Steps

1. **Add the font file:** Place `Cocogoose-Pro-Bold-Italic-trial.ttf` in `/public/fonts/`
2. The site will automatically use the custom font once added
3. Test with a stylus or touch device for enhanced pressure effects

---

**Note:** The current time is 02:00 (night), so you should see a **white background with black text**. At 6am, it will automatically switch to black background with white text.
