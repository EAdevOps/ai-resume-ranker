"use client";

import React from 'react';

export default function FileUploadNote({ file }: { file: File | null }) {
  if (file) {
    return <p className="text-sm text-gray-600">File "{file.name}" selected.</p>;
  }
  return <p className="text-sm text-gray-600">Please select a file.</p>;
}