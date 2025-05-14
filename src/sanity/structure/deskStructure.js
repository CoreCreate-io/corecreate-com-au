import { StructureBuilder } from 'sanity/desk'

export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      // Pages Manager - Singleton
      S.listItem()
        .title('Page Manager')
        .child(
          S.editor()
            .title('Page Manager')
            .id('sitePages')
            .schemaType('pages')
            .documentId('sitePages')
        ),

      // Show all other document types as usual
      ...S.documentTypeListItems().filter(
        (listItem) => !['pages'].includes(listItem.getId())
      ),
    ])