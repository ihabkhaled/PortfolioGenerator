/**
 * Rule: portfolio-architecture/no-react-in-pure-layers
 *
 * Services, repositories, providers, gateways, utils, helpers, mappers and
 * policies are React-free layers. They must not import `react`, `react-dom`,
 * or any React-related runtime so they stay testable without a renderer and
 * safe to call from server code.
 */

import {
  getSourcePath,
  isPureLogicFile,
  isProviderFile,
  isRepositoryFile,
  isServiceFile,
  isGatewayFile,
  isTestFile,
  toPosixPath,
} from '../shared/source-utils.mjs';

const REACT_PACKAGES = new Set([
  'react',
  'react-dom',
  'react-dom/server',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
]);

function isReactImport(source) {
  return REACT_PACKAGES.has(source) || source.startsWith('react/');
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'React-free layers (services, repositories, providers, gateways, utils, helpers, mappers, policies) must not import react or react-dom.',
    },
    schema: [],
    messages: {
      reactInPureLayer:
        "React-free layer '{{layer}}' must not import '{{source}}'. Move React concerns into hooks, containers, or components.",
    },
  },
  create(context) {
    const sourcePath = getSourcePath(toPosixPath(context.filename));

    if (!sourcePath || isTestFile(sourcePath)) {
      return {};
    }

    let layer = null;

    if (isServiceFile(sourcePath)) {
      layer = 'services';
    } else if (isRepositoryFile(sourcePath)) {
      layer = 'repositories';
    } else if (isProviderFile(sourcePath)) {
      layer = 'providers';
    } else if (isGatewayFile(sourcePath)) {
      layer = 'gateway';
    } else if (isPureLogicFile(sourcePath)) {
      layer = 'utils/helpers/mappers/policies';
    }

    if (!layer) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = String(node.source.value);

        if (isReactImport(source)) {
          context.report({
            node,
            messageId: 'reactInPureLayer',
            data: { layer, source },
          });
        }
      },
    };
  },
};
