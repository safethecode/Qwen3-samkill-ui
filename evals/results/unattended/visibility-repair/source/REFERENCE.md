# Resume list visual observations

Source observed during evaluation: samkill-ui Round 09 `evidence/first-list.png`, desktop 1440 pixels wide. This is an observation summary, not an included source image or a pixel-exact specification.

- The heading and short explanation sit at the left of the content region. The new-document action is aligned at the right. The heading is not centered above the page.
- Filters and search form a second horizontal row. They remain visibly secondary to the page heading.
- Three document cards occupy the main row. The primary visual content is a document preview, not a small metadata tile.
- Each card contains a pale preview stage and a white paper surface with a person's name, role, introduction and a section heading. Metadata and editing actions sit below that preview.
- The page uses a quiet neutral background, white content surfaces, dark readable typography and blue for the main action. Spacing groups the interface without ornamental dividers.

Apply these relationships to the reduced resume fixture without adding Round 09 features that were not requested. Mobile stacking must be verified in the generated result. This source observation alone does not establish a mobile match.

# Document collections

Use this pattern only when the reference's main content is a collection of documents. Do not turn dashboards, settings or editorial pages into document cards.

Preserve the hierarchy in this order:

1. Left-aligned page title and description, with the primary creation action at the opposite edge.
2. Secondary filters and a visibly labeled search field.
3. The actual document preview as the dominant card content.
4. Document title, role/status and modification date below the preview.
5. Editing as the primary card action; duplication and archival as secondary actions.

A metadata-only tile is not equivalent to a document preview. The preview needs the person's actual name (이름), role, introduction and a relevant section heading. A document title (제목) does not substitute for the person's name. Mark sample documents with a visible sample-status badge on each card. Render user values with `textContent` or the application's verified escaping function.

Make the paper an actual child of the pale stage, with its own explicit white background. A stage and paper placed as siblings produce an empty block above the document. Keep metadata and action controls outside the paper. Render sample-status badge text such as 예시 in the card-rendering function; a boolean stored in the data is insufficient. These badges are unrelated to form input labels. Preserve every user-entered string in both the preview and metadata without interpreting it as markup.

Use existing project tokens for all colors, type and spacing. The geometry below is a starting point to adapt to the observed reference, not a new theme:

```css
.collection-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.document-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.document-stage {
  height: 228px;
  padding: 20px 20px 0;
  overflow: hidden;
}
.document-paper {
  min-height: 280px;
  padding: 24px 20px;
}
.document-paper p {
  line-height: 1.6;
}
@media (max-width: 760px) {
  .collection-heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .document-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Review desktop and mobile screenshots after applying the pattern. Check that the paper has readable content, the preview is visibly distinct from the card surface, actions do not overflow, and the document list remains the main focus. Do not claim reference parity from using these selectors.
