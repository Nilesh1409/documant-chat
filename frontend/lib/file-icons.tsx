import {
  FileText,
  FileImage,
  File,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileVideo,
  FileIcon as FilePdf,
} from "lucide-react"

export function getFileIcon(fileType: string) {
  if (!fileType) return File

  if (fileType.includes("pdf")) {
    return FilePdf
  } else if (
    fileType.includes("word") ||
    fileType.includes("msword") ||
    fileType.includes("document") ||
    fileType.includes("rtf") ||
    fileType.includes("text")
  ) {
    return FileText
  } else if (
    fileType.includes("image") ||
    fileType.includes("jpg") ||
    fileType.includes("jpeg") ||
    fileType.includes("png") ||
    fileType.includes("gif") ||
    fileType.includes("svg")
  ) {
    return FileImage
  } else if (
    fileType.includes("excel") ||
    fileType.includes("spreadsheet") ||
    fileType.includes("csv") ||
    fileType.includes("numbers")
  ) {
    return FileSpreadsheet
  } else if (
    fileType.includes("code") ||
    fileType.includes("json") ||
    fileType.includes("xml") ||
    fileType.includes("html") ||
    fileType.includes("css") ||
    fileType.includes("javascript")
  ) {
    return FileCode
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileType.includes("compressed") ||
    fileType.includes("rar") ||
    fileType.includes("7z")
  ) {
    return FileArchive
  } else if (
    fileType.includes("audio") ||
    fileType.includes("mp3") ||
    fileType.includes("wav") ||
    fileType.includes("ogg")
  ) {
    return FileAudio
  } else if (
    fileType.includes("video") ||
    fileType.includes("mp4") ||
    fileType.includes("mov") ||
    fileType.includes("avi")
  ) {
    return FileVideo
  }

  return File
}
