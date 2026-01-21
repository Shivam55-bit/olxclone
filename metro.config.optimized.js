// metro.config.optimized.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration optimized for React Native performance
 * This replaces your existing metro.config.js with performance enhancements
 */

// ✅ Custom asset extensions for optimal loading
const assetExts = [
    // Images
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
    // Fonts  
    'ttf', 'otf', 'woff', 'woff2',
    // Audio/Video
    'mp3', 'mp4', 'mov', 'avi',
    // Documents
    'pdf', 'doc', 'docx',
    // Data
    'json', 'xml'
];

// ✅ Source extensions for faster resolution
const sourceExts = [
    'js', 'jsx', 'ts', 'tsx', 'json',
    // Platform-specific extensions
    'android.js', 'android.tsx', 'android.ts',
    'ios.js', 'ios.tsx', 'ios.ts',
    'native.js', 'native.tsx', 'native.ts',
    'web.js', 'web.tsx', 'web.ts'
];

// ✅ Platforms for cross-platform support
const platforms = ['ios', 'android', 'web', 'windows'];

const defaultConfig = getDefaultConfig(__dirname);

// ✅ Performance optimization configuration
const optimizedConfig = {
    resolver: {
        // ✅ Asset and source extensions
        assetExts,
        sourceExts,
        platforms,

        // ✅ Node modules resolution optimization  
        nodeModulesPaths: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '../node_modules'), // For monorepo support
        ],

        // ✅ Block list for faster resolution
        blockList: [
            // Ignore unnecessary files
            /.*\/Pods\/.*/,
            /.*\/build\/.*/,
            /.*\/android\/app\/build\/.*/,
            /.*\/ios\/build\/.*/,
            /.*\/\.git\/.*/,
            /.*\/\.DS_Store$/,
            /.*\/node_modules\/.*\/test\/.*/,
            /.*\/node_modules\/.*\/tests\/.*/,
            /.*\/node_modules\/.*\/__tests__\/.*/,
            /.*\/node_modules\/.*\/\.git\/.*/,
            // Block duplicate React Native modules
            /.*\/node_modules\/react-native\/Libraries\/react-native\/react-native-implementation\.js$/,
        ],

        // ✅ Alias for faster imports
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@screens': path.resolve(__dirname, 'src/screens'),
            '@apis': path.resolve(__dirname, 'src/apis'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@images': path.resolve(__dirname, 'src/images'),
            '@contexts': path.resolve(__dirname, 'src/contexts'),
        },

        // ✅ Faster dependency resolution
        unstable_enablePackageExports: true,
        unstable_conditionNames: ['react-native', 'browser', 'require'],
    },

    transformer: {
        // ✅ Hermes bytecode optimization
        hermesCommand: path.resolve(__dirname, 'node_modules/react-native/sdks/hermesc/osx-bin/hermesc'),
        
        // ✅ Minification settings
        minifierConfig: {
            ecma: 8,
            keep_fnames: true,
            mangle: {
                keep_fnames: true,
                keep_classnames: true,
            },
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
                passes: 2,
            },
            output: {
                ascii_only: true,
                quote_keys: false,
                wrap_iife: true,
            },
        },

        // ✅ Asset transformations
        assetPlugins: [
            // Add image optimization plugins here if needed
        ],

        // ✅ Babel transformer settings
        babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
        
        // ✅ SVG support
        svgAssetPlugin: {
            httpServerLocation: '/assets',
            getTransformModulePath() {
                return require.resolve('react-native-svg-transformer');
            },
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: true, // ✅ Inline requires for better performance
                },
            }),
        },
    },

    serializer: {
        config: {
            // ✅ Code splitting for better performance
            createModuleIdFactory: () => (path) => {
                // Create deterministic module IDs
                return path.replace(__dirname, '').replace(/\//g, '-').replace(/\\/g, '-');
            },
        },

        // ✅ Custom module filter for smaller bundles
        getModulesRunBeforeMainModule: () => [
            // Add critical modules that should run before main module
            require.resolve('react-native/Libraries/Core/InitializeCore'),
            require.resolve('react-native-gesture-handler/react-native-gesture-handler'),
        ],

        // ✅ Optimize bundle splitting
        getPolyfills: () => [
            // Add only necessary polyfills
            require.resolve('react-native/Libraries/polyfills/console.js'),
            require.resolve('react-native/Libraries/polyfills/error-guard.js'),
            require.resolve('react-native/Libraries/polyfills/Object.es7.js'),
        ],
    },

    server: {
        // ✅ Development server optimization
        port: 8081,
        enhanceMiddleware: (middleware) => {
            // Add custom middleware for development
            return (req, res, next) => {
                // Add performance headers
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                middleware(req, res, next);
            };
        },
    },

    watcher: {
        // ✅ File watching optimization
        additionalExts: ['js', 'ts', 'tsx'],
        ignore: [
            /.*\/node_modules\/.*/, 
            /.*\/build\/.*/, 
            /.*\/\.git\/.*/,
            /.*\/android\/app\/build\/.*/,
            /.*\/ios\/build\/.*/,
            /.*\/ios\/Pods\/.*/,
        ],
        
        // ✅ Faster file watching
        watchman: {
            defer_states: ['hg.update'],
            ignore_dirs: ['node_modules', '.git', 'build', 'ios/build', 'android/app/build'],
        },
    },

    // ✅ Caching optimization
    cacheStores: [
        {
            name: 'FileStore',
            options: {
                cacheDirectory: path.resolve(__dirname, 'node_modules/.metro-cache'),
            },
        },
    ],

    // ✅ Reset cache configuration
    resetCache: false,
    maxWorkers: 4, // Adjust based on your CPU cores

    // ✅ Experimental features for better performance
    experimentalImportSupport: false,
    unstable_allowRequireContext: true,
};

// ✅ Environment-specific optimizations
if (process.env.NODE_ENV === 'production') {
    // Production-only optimizations
    optimizedConfig.transformer.minifierConfig.compress.drop_console = true;
    optimizedConfig.transformer.minifierConfig.compress.dead_code = true;
    optimizedConfig.serializer.config.processModuleFilter = (modules) => {
        // Filter out development-only modules
        return modules.filter(module => 
            !module.path.includes('__DEV__') &&
            !module.path.includes('react-devtools') &&
            !module.path.includes('remote-debugging')
        );
    };
} else {
    // Development-only optimizations
    optimizedConfig.server.enableVisualizer = true;
    optimizedConfig.transformer.minifierConfig.compress.drop_console = false;
}

// ✅ Bundle analysis for debugging (development only)
if (process.env.ANALYZE_BUNDLE === 'true') {
    optimizedConfig.serializer.config.getRunModuleStatement = (moduleId) => {
        console.log(`Loading module: ${moduleId}`);
        return `__r(${JSON.stringify(moduleId)})`;
    };
}

// ✅ Merge with default configuration
module.exports = mergeConfig(defaultConfig, optimizedConfig);

// ✅ Export for testing purposes
module.exports.optimizedConfig = optimizedConfig;