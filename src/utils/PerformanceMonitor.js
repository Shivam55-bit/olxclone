// src/utils/PerformanceMonitor.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager, Platform } from 'react-native';

// ✅ Global Performance Monitor - Production Ready
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            navigation: new Map(),
            api: new Map(),
            renders: new Map(),
            memory: new Map(),
            interactions: [],
        };

        this.thresholds = {
            navigation: 1000, // 1 second
            api: 5000, // 5 seconds  
            render: 16, // 16ms (60fps)
            memory: 150 * 1024 * 1024, // 150MB
        };

        this.isMonitoring = __DEV__ || false;
        this.reportQueue = [];
        this.maxReports = 100;

        this.initializeMonitoring();
    }

    // 🚀 Initialize monitoring
    initializeMonitoring() {
        if (!this.isMonitoring) return;

        // Start memory monitoring
        this.startMemoryMonitoring();
        
        // Monitor JavaScript thread
        this.monitorJSThread();
        
        // Setup performance observers
        this.setupPerformanceObservers();
        
        console.log('📊 Performance Monitor initialized');
    }

    // 📐 Navigation Performance Tracking
    startNavigationTracking(screenName) {
        if (!this.isMonitoring) return null;

        const startTime = performance.now();
        const navigationId = `nav_${Date.now()}_${Math.random()}`;

        this.metrics.navigation.set(navigationId, {
            screenName,
            startTime,
            status: 'started'
        });

        return navigationId;
    }

    endNavigationTracking(navigationId) {
        if (!this.isMonitoring || !navigationId) return;

        const navData = this.metrics.navigation.get(navigationId);
        if (!navData) return;

        const endTime = performance.now();
        const duration = endTime - navData.startTime;

        navData.endTime = endTime;
        navData.duration = duration;
        navData.status = 'completed';

        // ⚠️ Log slow navigation
        if (duration > this.thresholds.navigation) {
            this.reportPerformanceIssue('SLOW_NAVIGATION', {
                screen: navData.screenName,
                duration,
                threshold: this.thresholds.navigation
            });
        }

        return duration;
    }

    // 🌐 API Performance Tracking
    startApiTracking(endpoint, method = 'GET') {
        if (!this.isMonitoring) return null;

        const startTime = performance.now();
        const apiId = `api_${Date.now()}_${Math.random()}`;

        this.metrics.api.set(apiId, {
            endpoint,
            method,
            startTime,
            status: 'started'
        });

        return apiId;
    }

    endApiTracking(apiId, success = true, responseSize = 0) {
        if (!this.isMonitoring || !apiId) return;

        const apiData = this.metrics.api.get(apiId);
        if (!apiData) return;

        const endTime = performance.now();
        const duration = endTime - apiData.startTime;

        apiData.endTime = endTime;
        apiData.duration = duration;
        apiData.success = success;
        apiData.responseSize = responseSize;
        apiData.status = 'completed';

        // ⚠️ Log slow API calls
        if (duration > this.thresholds.api) {
            this.reportPerformanceIssue('SLOW_API', {
                endpoint: apiData.endpoint,
                method: apiData.method,
                duration,
                threshold: this.thresholds.api,
                success
            });
        }

        return duration;
    }

    // 🎨 Render Performance Tracking
    trackRender(componentName, renderStart, renderEnd) {
        if (!this.isMonitoring) return;

        const duration = renderEnd - renderStart;
        
        if (!this.metrics.renders.has(componentName)) {
            this.metrics.renders.set(componentName, {
                totalRenders: 0,
                totalTime: 0,
                averageTime: 0,
                slowRenders: 0
            });
        }

        const renderData = this.metrics.renders.get(componentName);
        renderData.totalRenders++;
        renderData.totalTime += duration;
        renderData.averageTime = renderData.totalTime / renderData.totalRenders;

        // ⚠️ Track slow renders (above 16ms for 60fps)
        if (duration > this.thresholds.render) {
            renderData.slowRenders++;
            
            this.reportPerformanceIssue('SLOW_RENDER', {
                component: componentName,
                duration,
                threshold: this.thresholds.render,
                renderCount: renderData.totalRenders
            });
        }
    }

    // 💾 Memory Monitoring
    startMemoryMonitoring() {
        if (!this.isMonitoring || Platform.OS === 'web') return;

        setInterval(() => {
            this.collectMemoryMetrics();
        }, 10000); // Every 10 seconds
    }

    collectMemoryMetrics() {
        if (global.performance && global.performance.memory) {
            const memoryInfo = {
                used: global.performance.memory.usedJSHeapSize,
                total: global.performance.memory.totalJSHeapSize,
                limit: global.performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };

            this.metrics.memory.set(Date.now(), memoryInfo);

            // ⚠️ Check for memory leaks
            if (memoryInfo.used > this.thresholds.memory) {
                this.reportPerformanceIssue('HIGH_MEMORY_USAGE', {
                    used: memoryInfo.used,
                    total: memoryInfo.total,
                    threshold: this.thresholds.memory,
                    percentage: (memoryInfo.used / memoryInfo.total) * 100
                });
            }

            // Keep only last 50 memory snapshots
            if (this.metrics.memory.size > 50) {
                const firstKey = this.metrics.memory.keys().next().value;
                this.metrics.memory.delete(firstKey);
            }
        }
    }

    // 🧵 JavaScript Thread Monitoring
    monitorJSThread() {
        if (!this.isMonitoring) return;

        let lastTime = performance.now();
        
        const checkJSThread = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            
            // If delta is significantly higher than expected, JS thread was blocked
            if (deltaTime > 100) { // 100ms threshold
                this.reportPerformanceIssue('JS_THREAD_BLOCKED', {
                    blockDuration: deltaTime,
                    expectedInterval: 16.67, // 60fps
                    timestamp: currentTime
                });
            }
            
            lastTime = currentTime;
            requestAnimationFrame(checkJSThread);
        };

        requestAnimationFrame(checkJSThread);
    }

    // 🔍 Performance Observers
    setupPerformanceObservers() {
        if (!this.isMonitoring || !global.PerformanceObserver) return;

        try {
            // Observe long tasks
            const longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) { // 50ms threshold
                        this.reportPerformanceIssue('LONG_TASK', {
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            });

            longTaskObserver.observe({ entryTypes: ['longtask'] });

        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }

    // 📊 User Interaction Tracking
    trackUserInteraction(interactionType, component, duration = null) {
        if (!this.isMonitoring) return;

        const interaction = {
            type: interactionType,
            component,
            timestamp: Date.now(),
            duration
        };

        this.metrics.interactions.push(interaction);

        // Keep only last 100 interactions
        if (this.metrics.interactions.length > 100) {
            this.metrics.interactions.shift();
        }

        // Track slow interactions
        if (duration && duration > 100) {
            this.reportPerformanceIssue('SLOW_INTERACTION', {
                type: interactionType,
                component,
                duration,
                threshold: 100
            });
        }
    }

    // ⚠️ Report Performance Issues
    reportPerformanceIssue(type, data) {
        const report = {
            type,
            data,
            timestamp: Date.now(),
            platform: Platform.OS,
            version: Platform.Version
        };

        this.reportQueue.push(report);

        // Log critical issues immediately
        if (['SLOW_NAVIGATION', 'HIGH_MEMORY_USAGE', 'JS_THREAD_BLOCKED'].includes(type)) {
            console.warn(`🚨 Performance Issue [${type}]:`, data);
        }

        // Maintain queue size
        if (this.reportQueue.length > this.maxReports) {
            this.reportQueue.shift();
        }

        // Auto-send reports in development
        if (__DEV__) {
            this.logPerformanceReport(report);
        }
    }

    // 📝 Log Performance Report
    logPerformanceReport(report) {
        const formattedReport = `
🔍 Performance Report - ${report.type}
⏰ Time: ${new Date(report.timestamp).toLocaleTimeString()}
📱 Platform: ${report.platform}
📊 Data: ${JSON.stringify(report.data, null, 2)}
        `;
        
        console.log(formattedReport);
    }

    // 📈 Get Performance Summary
    getPerformanceSummary() {
        const summary = {
            navigation: this.getNavigationSummary(),
            api: this.getApiSummary(),
            renders: this.getRenderSummary(),
            memory: this.getMemorySummary(),
            issues: this.reportQueue.length,
            timestamp: Date.now()
        };

        return summary;
    }

    getNavigationSummary() {
        const navs = Array.from(this.metrics.navigation.values())
            .filter(nav => nav.status === 'completed');

        if (navs.length === 0) return { count: 0 };

        const durations = navs.map(nav => nav.duration);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const slowNavs = durations.filter(d => d > this.thresholds.navigation).length;

        return {
            count: navs.length,
            averageDuration: avgDuration,
            slowNavigations: slowNavs,
            fastestNavigation: Math.min(...durations),
            slowestNavigation: Math.max(...durations)
        };
    }

    getApiSummary() {
        const apis = Array.from(this.metrics.api.values())
            .filter(api => api.status === 'completed');

        if (apis.length === 0) return { count: 0 };

        const durations = apis.map(api => api.duration);
        const successfulApis = apis.filter(api => api.success).length;
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        return {
            count: apis.length,
            averageDuration: avgDuration,
            successRate: (successfulApis / apis.length) * 100,
            slowApiCalls: durations.filter(d => d > this.thresholds.api).length
        };
    }

    getRenderSummary() {
        const renders = Array.from(this.metrics.renders.values());
        
        if (renders.length === 0) return { components: 0 };

        const totalRenders = renders.reduce((sum, r) => sum + r.totalRenders, 0);
        const totalSlowRenders = renders.reduce((sum, r) => sum + r.slowRenders, 0);
        
        return {
            components: renders.length,
            totalRenders,
            slowRenders: totalSlowRenders,
            slowRenderRate: (totalSlowRenders / totalRenders) * 100
        };
    }

    getMemorySummary() {
        const memories = Array.from(this.metrics.memory.values());
        
        if (memories.length === 0) return { snapshots: 0 };

        const latestMemory = memories[memories.length - 1];
        const avgUsage = memories.reduce((sum, m) => sum + m.used, 0) / memories.length;

        return {
            snapshots: memories.length,
            currentUsage: latestMemory?.used || 0,
            averageUsage: avgUsage,
            peakUsage: Math.max(...memories.map(m => m.used))
        };
    }

    // 💾 Persist Performance Data
    async savePerformanceData() {
        try {
            const summary = this.getPerformanceSummary();
            await AsyncStorage.setItem(
                'performance_data',
                JSON.stringify(summary)
            );
        } catch (error) {
            console.warn('Failed to save performance data:', error);
        }
    }

    async loadPerformanceData() {
        try {
            const data = await AsyncStorage.getItem('performance_data');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Failed to load performance data:', error);
            return null;
        }
    }

    // 🧹 Cleanup
    cleanup() {
        this.metrics.navigation.clear();
        this.metrics.api.clear();
        this.metrics.renders.clear();
        this.metrics.memory.clear();
        this.metrics.interactions = [];
        this.reportQueue = [];
    }

    // 🎛️ Control methods
    enableMonitoring() {
        this.isMonitoring = true;
        this.initializeMonitoring();
    }

    disableMonitoring() {
        this.isMonitoring = false;
        this.cleanup();
    }
}

// ✅ React Hook for Performance Tracking
import { useEffect, useRef } from 'react';

export const usePerformanceTracking = (componentName) => {
    const renderStartRef = useRef();
    
    // Track component mount/unmount
    useEffect(() => {
        performanceMonitor.trackUserInteraction('COMPONENT_MOUNT', componentName);
        
        return () => {
            performanceMonitor.trackUserInteraction('COMPONENT_UNMOUNT', componentName);
        };
    }, [componentName]);

    // Track render performance
    useEffect(() => {
        const renderEnd = performance.now();
        if (renderStartRef.current) {
            performanceMonitor.trackRender(
                componentName,
                renderStartRef.current,
                renderEnd
            );
        }
    });

    // Set render start time
    renderStartRef.current = performance.now();

    return {
        trackInteraction: (type, duration) => 
            performanceMonitor.trackUserInteraction(type, componentName, duration),
        trackApiCall: (endpoint, method) => 
            performanceMonitor.startApiTracking(endpoint, method),
        finishApiCall: (apiId, success, responseSize) => 
            performanceMonitor.endApiTracking(apiId, success, responseSize)
    };
};

// ✅ Navigation Performance Hook
export const useNavigationPerformance = (screenName) => {
    useEffect(() => {
        const navigationId = performanceMonitor.startNavigationTracking(screenName);
        
        // End tracking when component is ready
        const endTracking = () => {
            InteractionManager.runAfterInteractions(() => {
                performanceMonitor.endNavigationTracking(navigationId);
            });
        };

        // Small delay to ensure screen is fully loaded
        const timer = setTimeout(endTracking, 100);
        
        return () => {
            clearTimeout(timer);
            performanceMonitor.endNavigationTracking(navigationId);
        };
    }, [screenName]);
};

// ✅ Global Performance Monitor Instance
const performanceMonitor = new PerformanceMonitor();

// ✅ Performance Report HOC
export const withPerformanceTracking = (WrappedComponent, componentName) => {
    return React.forwardRef((props, ref) => {
        usePerformanceTracking(componentName || WrappedComponent.name);
        
        return <WrappedComponent {...props} ref={ref} />;
    });
};

export default performanceMonitor;