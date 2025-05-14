import { definePlugin } from 'sanity'
import { MdWeb, MdDashboard } from 'react-icons/md'
import { FaHome, FaInfoCircle, FaTools, FaEnvelope } from 'react-icons/fa'

// Map of page schema types to their icons and titles
const PAGE_ICONS = {
  homePage: FaHome,
  aboutPage: FaInfoCircle,
  servicesPage: FaTools,
  contactPage: FaEnvelope,
  // Add new pages here with their icons
}

// This is what you need to export for structureTool to use
export const structure = (S) => {
  // Automatically get all schema types that end with "Page"
  const pageSchemaTypes = S.documentTypeListItems()
    .filter(listItem => {
      const schemaType = listItem.getId();
      return schemaType.endsWith('Page');
    })
    .map(item => item.getId());
  
  // Create page items that go inside the Page Manager
  const pageItems = pageSchemaTypes.map(pageType => 
    S.listItem()
      .title(pageType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(' Page', ''))
      .icon(PAGE_ICONS[pageType] || MdWeb)
      .child(
        S.document()
          .schemaType(pageType)
          .documentId(pageType)
      )
  );
  
  // Create the Page Manager section as main container
  const pageManagerSection = S.listItem()
    .title('Page Manager')
    .icon(MdDashboard)
    .child(
      S.list()
        .title('Site Pages')
        .items(pageItems)
    );
  
  // Create the rest of the structure (excluding page types)
  const nonPageItems = S.documentTypeListItems()
    .filter(listItem => !pageSchemaTypes.includes(listItem.getId()));
  
  // Return the complete structure
  return S.list()
    .title('Content')
    .items([pageManagerSection, ...nonPageItems]);
};

// Plugin to customize the desk tool - auto-discovers page schemas
export const pageManagerPlugin = definePlugin({
  name: 'page-manager',
  document: {
    // Prevent creating new documents for page types
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          templateItem => !templateItem.templateId.endsWith('Page')
        )
      }
      return prev
    },
    // Prevent actions on page documents
    actions: (prev, { schemaType }) => {
      if (schemaType.endsWith('Page')) {
        return prev.filter(({ action }) => 
          ['update', 'publish', 'discardChanges', 'restore'].includes(action)
        )
      }
      return prev
    }
  }
});