import React, { Suspense } from "react";

// Import the Editor component directly
const TinyMCEEditor = React.lazy(() => 
  import("@tinymce/tinymce-react").then(module => ({ default: module.Editor }))
);

interface EditorWrapperProps {
  tinymceScriptSrc?: string;
  onInit?: (evt: any, editor: any) => void;
  value: string;
  init?: any;
  onEditorChange?: (content: string) => void;
}

export default function EditorWrapper(props: EditorWrapperProps) {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <TinyMCEEditor {...props} />
    </Suspense>
  );
}
