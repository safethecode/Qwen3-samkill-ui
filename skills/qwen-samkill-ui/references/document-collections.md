# Document collections

Use this pattern only when the reference's main content is a collection of documents. Do not turn dashboards, settings or editorial pages into document cards.

Preserve the hierarchy in this order:

1. Left-aligned page title and description, with the primary creation action at the opposite edge.
2. Secondary filters and a visibly labeled search field.
3. The actual document preview as the dominant card content.
4. Document title, role/status and modification date below the preview.
5. Editing as the primary card action; duplication and archival as secondary actions.

A metadata-only tile is not equivalent to a document preview. The preview needs actual name, role, introduction and a relevant section heading. Mark sample documents as examples. Render user values with `textContent` or the application's verified escaping function.

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
