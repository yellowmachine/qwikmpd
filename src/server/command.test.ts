import { describe, it, expect } from "vitest";
import { getFirstLevel, toBeIncluded } from "./mpd";

const mockData = [
  {
    directory: "acdc",
    file: [
      "acdc/track1.mp3",
      "acdc/track2.mp3",
      "acdc/folder1/song1.mp3",
      "acdc/folder2/song2.mp3"
    ]
  },
  {
    directory: "acdc/folder1",
    file: [
      "acdc/folder1/song1.mp3",
      "acdc/folder1/song3.mp3"
    ]
  },
  {
    directory: "acdc/folder2",
    file: [
      "acdc/folder2/song2.mp3"
    ]
  }
];

describe("toBeIncluded", () => {
    it("returns null for an empty string", () => {
      expect(toBeIncluded("")).toBeNull();
    });
  
    it("returns null for a single slash", () => {
      expect(toBeIncluded("/")).toBeNull();
    });
  
    it("returns null for subdirectory paths", () => {
      expect(toBeIncluded("folder/file.mp3")).toBeNull();
      expect(toBeIncluded("/folder/file.mp3")).toBeNull();
      expect(toBeIncluded("folder/subfolder/file.mp3")).toBeNull();
    });
  
    it("returns the name if it is a top-level file", () => {
      expect(toBeIncluded("song.mp3")).toBe("song.mp3");
      expect(toBeIncluded("/song.mp3")).toBe("song.mp3");
    });
  
    it("does not confuse visually similar characters to '/'", () => {
      // U+29F8 "⧸" (Big Solidus) is not a real slash
      expect(toBeIncluded("AC⧸DC - Back In Black.mp3")).toBe("AC⧸DC - Back In Black.mp3");
      expect(toBeIncluded("/AC⧸DC - Back In Black.mp3")).toBe("AC⧸DC - Back In Black.mp3");
    });
  
    it("returns null if the name is only subfolders", () => {
      expect(toBeIncluded("folder/")).toBeNull();
      expect(toBeIncluded("/folder/")).toBeNull();
    });
  });

describe("getFirstLevel", () => {
    it("returns first-level directories and files in the 'acdc' root", () => {
      const result = getFirstLevel(mockData, "acdc");
      expect(result.directories.sort()).toEqual(["folder1", "folder2"]);
      expect(result.files.sort()).toEqual(["track1.mp3", "track2.mp3"]);
    });
  
    it("returns only files if there are no subdirectories", () => {
      const result = getFirstLevel(mockData, "acdc/folder2");
      expect(result.directories).toEqual([]);
      expect(result.files).toEqual(["song2.mp3"]);
    });
  
    it("returns empty arrays if the path does not exist", () => {
      const result = getFirstLevel(mockData, "acdc/nonexistent");
      expect(result.directories).toEqual([]);
      expect(result.files).toEqual([]);
    });
  });

