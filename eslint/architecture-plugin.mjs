/**
 * Local ESLint plugin: portfolio-architecture
 *
 * Enforces the architecture contract no off-the-shelf plugin can: TSX-only
 * component files, layered one-way imports, package boundaries, React-free
 * services/repositories/providers, env/browser facades, i18n copy discipline,
 * justified client boundaries — plus the two tenancy invariants this product
 * lives or dies by: the public render path never imports authoring code, and
 * tenant-free lookups stay confined to reviewed locations.
 *
 * Rule documentation lives in docs/eslint/<rule-name>.md.
 */

import noAuthoringImportsInPublicRender from './architecture-plugin/rules/no-authoring-imports-in-public-render.mjs';
import noCrossModuleDeepImports from './architecture-plugin/rules/no-cross-module-deep-imports.mjs';
import noDirectBrowserApiOutsidePackages from './architecture-plugin/rules/no-direct-browser-api-outside-packages.mjs';
import noHooksInComponents from './architecture-plugin/rules/no-hooks-in-components.mjs';
import noInlineClassnameOutsideDesignSystem from './architecture-plugin/rules/no-inline-classname-outside-design-system.mjs';
import noInlineComponentLogic from './architecture-plugin/rules/no-inline-component-logic.mjs';
import noInlineDeclarations from './architecture-plugin/rules/no-inline-declarations.mjs';
import noProcessEnvOutsideConfig from './architecture-plugin/rules/no-process-env-outside-config.mjs';
import noRawI18nText from './architecture-plugin/rules/no-raw-i18n-text.mjs';
import noRawPackageImports from './architecture-plugin/rules/no-raw-package-imports.mjs';
import noReactInPureLayers from './architecture-plugin/rules/no-react-in-pure-layers.mjs';
import noRestrictedLayerImports from './architecture-plugin/rules/no-restricted-layer-imports.mjs';
import noServerOnlyImportInClient from './architecture-plugin/rules/no-server-only-import-in-client.mjs';
import noUnscopedRepositoryAccess from './architecture-plugin/rules/no-unscoped-repository-access.mjs';
import requireClientComponentReason from './architecture-plugin/rules/require-client-component-reason.mjs';

export const portfolioArchitecturePlugin = {
  meta: {
    name: 'portfolio-architecture',
    version: '1.0.0',
  },
  rules: {
    'no-authoring-imports-in-public-render': noAuthoringImportsInPublicRender,
    'no-cross-module-deep-imports': noCrossModuleDeepImports,
    'no-direct-browser-api-outside-packages': noDirectBrowserApiOutsidePackages,
    'no-hooks-in-components': noHooksInComponents,
    'no-inline-classname-outside-design-system': noInlineClassnameOutsideDesignSystem,
    'no-inline-component-logic': noInlineComponentLogic,
    'no-inline-declarations': noInlineDeclarations,
    'no-process-env-outside-config': noProcessEnvOutsideConfig,
    'no-raw-i18n-text': noRawI18nText,
    'no-raw-package-imports': noRawPackageImports,
    'no-react-in-pure-layers': noReactInPureLayers,
    'no-restricted-layer-imports': noRestrictedLayerImports,
    'no-server-only-import-in-client': noServerOnlyImportInClient,
    'no-unscoped-repository-access': noUnscopedRepositoryAccess,
    'require-client-component-reason': requireClientComponentReason,
  },
};
