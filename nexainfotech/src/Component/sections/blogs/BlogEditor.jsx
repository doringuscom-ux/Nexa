import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link'
];

const BlogEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="blog-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Write your story here..."}
        className="text-white/80"
      />
      
      <style>{`
        .blog-editor-wrapper {
          border-radius: 1rem;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
        }
        .ql-container.ql-snow {
          border: none;
          min-height: 250px;
          font-size: 1.125rem;
          font-family: inherit;
        }
        .ql-editor {
          padding: 1.5rem;
          line-height: 1.75;
          min-height: 250px;
        }
        .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.2);
          font-style: normal;
          left: 1.5rem;
        }
        .ql-snow .ql-stroke {
          stroke: rgba(255, 255, 255, 0.6);
        }
        .ql-snow .ql-fill {
          fill: rgba(255, 255, 255, 0.6);
        }
        .ql-snow .ql-picker {
          color: rgba(255, 255, 255, 0.6);
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke {
          stroke: #22d3ee;
        }
        .ql-snow.ql-toolbar button:hover .ql-fill {
          fill: #22d3ee;
        }
        .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #22d3ee;
        }
        .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #22d3ee;
        }
        .ql-picker-options {
          background-color: #111122 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 8px;
          margin-top: 5px;
        }
        .ql-snow .ql-picker.ql-expanded .ql-picker-label {
           border-color: rgba(255, 255, 255, 0.2);
        }
        .ql-snow .ql-tooltip {
          background-color: #111122;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }
        .ql-snow .ql-tooltip input[type=text] {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 4px;
          padding: 4px 8px;
        }
        .ql-snow .ql-tooltip a.ql-action::after {
          color: #22d3ee;
        }
      `}</style>
    </div>
  );
};

export default BlogEditor;
