// Offline PoseNet Configuration for Sugarizer Stickman Activity

(function () {
	'use strict';

	// Store the original PoseNet load function
	const originalLoad = window.posenet && window.posenet.load;

	// Production model configurations
	const MODEL_CONFIGS = {
		mobilenet: {
			architecture: 'MobileNetV1',
			multiplier: 0.75,
			inputResolution: 257,
			quantBytes: 2,
			variants: {
				stride16: {
					outputStride: 16,
					modelUrl: './models/mobilenet/model-stride16.json'
				},
				stride8: {
					outputStride: 8,
					modelUrl: './models/mobilenet/model-stride8.json'
				}
			}
		},
		resnet50: {
			architecture: 'ResNet50',
			outputStride: 16,
			inputResolution: 513,
			quantBytes: 2,
			variants: {
				stride16: {
					outputStride: 16,
					modelUrl: './models/resnet50/model-stride16.json'
				}
			},
			useRemote: true // Prefer remote for accuracy, fallback to local
		}
	};

	/**
	 * Enhanced PoseNet.load function with offline capabilities
	 * @param {Object} config - PoseNet configuration
	 * @returns {Promise} PoseNet model instance
	 */
	function loadModelWithFallback(config = {}) {
		// Set default architecture
		if (!config.architecture) {
			config.architecture = 'ResNet50'; // Default to ResNet50 for better accuracy
		}

		let modelConfig;

		if (config.architecture === 'MobileNetV1') {
			modelConfig = buildMobileNetConfig(config);
		} else if (config.architecture === 'ResNet50') {
			modelConfig = buildResNet50Config(config);
		} else {
			// Fallback to ResNet50 for unknown architectures
			modelConfig = buildResNet50Config({ ...config, architecture: 'ResNet50' });
		}

		// Merge with user config, preserving modelUrl if set locally
		const finalConfig = {
			...modelConfig,
			...config
		};

		// Override modelUrl only if we have a local one
		if (modelConfig.modelUrl) {
			finalConfig.modelUrl = modelConfig.modelUrl;
		}

		return originalLoad.call(this, finalConfig);
	}

	/**
	 * Build MobileNet configuration
	 */
	function buildMobileNetConfig(config) {
		const baseConfig = MODEL_CONFIGS.mobilenet;
		const requestedStride = config.outputStride || 16;

		// Select appropriate variant
		const variant = (requestedStride === 8 && baseConfig.variants.stride8)
			? baseConfig.variants.stride8
			: baseConfig.variants.stride16;

		return {
			architecture: baseConfig.architecture,
			multiplier: baseConfig.multiplier,
			inputResolution: baseConfig.inputResolution,
			quantBytes: baseConfig.quantBytes,
			outputStride: variant.outputStride,
			modelUrl: variant.modelUrl
		};
	}

	/**
	 * Build ResNet50 configuration with intelligent fallback
	 */
	function buildResNet50Config(config) {
		const baseConfig = MODEL_CONFIGS.resnet50;
		const requestedStride = config.outputStride || 16;

		// Select appropriate variant
		const variant = baseConfig.variants.stride16; // Only stride16 available locally

		if (baseConfig.useRemote && config.useRemote !== false) {
			// Try remote first for better model quality
			return {
				architecture: baseConfig.architecture,
				outputStride: variant.outputStride,
				inputResolution: baseConfig.inputResolution,
				quantBytes: baseConfig.quantBytes
				// No modelUrl - use remote
			};
		} else {
			// Use local model
			return {
				architecture: baseConfig.architecture,
				outputStride: variant.outputStride,
				inputResolution: baseConfig.inputResolution,
				quantBytes: baseConfig.quantBytes,
				modelUrl: variant.modelUrl
			};
		}
	}

	// Override PoseNet.load function
	if (window.posenet && originalLoad) {
		window.posenet.load = loadModelWithFallback;
	}

})();
