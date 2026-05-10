import { describe, expect, it } from "vitest";
import {
  getYouTubeFormatThumbnailUrls,
  isPortraitImageSize,
  isYouTubeShortUrl
} from "./YouTubeEmbed";

describe("YouTubeEmbed helpers", () => {
  it("detects canonical YouTube Shorts URLs", () => {
    expect(isYouTubeShortUrl("https://www.youtube.com/shorts/gEJo8acnGDY")).toBe(true);
    expect(isYouTubeShortUrl("https://www.youtube.com/watch?v=gEJo8acnGDY")).toBe(false);
  });

  it("uses provided thumbnails for format detection without probing YouTube fallback URLs", () => {
    expect(getYouTubeFormatThumbnailUrls(
      "https://www.youtube.com/watch?v=gEJo8acnGDY",
      "https://i.ytimg.com/vi/gEJo8acnGDY/hqdefault.jpg"
    )).toEqual(["https://i.ytimg.com/vi/gEJo8acnGDY/hqdefault.jpg"]);
  });

  it("classifies portrait image dimensions with a margin", () => {
    expect(isPortraitImageSize(720, 1280)).toBe(true);
    expect(isPortraitImageSize(1280, 720)).toBe(false);
    expect(isPortraitImageSize(1000, 1050)).toBe(false);
  });
});
