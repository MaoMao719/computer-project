export const CHART_COLORS = {
  primary: '#6366F1',
  primaryHover: '#818CF8',
  primaryActive: '#4F46E5',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  chart1: '#818CF8',
  chart2: '#FBBF24',
  chart3: '#34D399',
  chart4: '#F472B6',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.8)',
  borderLight: 'rgba(226, 232, 240, 0.6)',
  bgContainer: 'rgba(255, 255, 255, 0.7)',
  bgElevated: 'rgba(255, 255, 255, 0.85)'
};

export function getChartConfig() {
  return { ...CHART_COLORS };
}

export function getLightTooltip() {
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(226, 232, 240, 0.6)',
    borderWidth: 1,
    padding: [16, 20],
    textStyle: {
      color: '#0F172A',
      fontSize: 14
    },
    extraCssText: 'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); border-radius: 16px; backdrop-filter: blur(20px);'
  };
}

export function getGridConfig(options = {}) {
  const {
    left = '3%',
    right = '5%',
    bottom = '5%',
    top = '10%',
    containLabel = true
  } = options;

  return {
    left,
    right,
    bottom,
    top,
    containLabel
  };
}

export function getAxisConfig(axisType = 'category', options = {}) {
  const colors = getChartConfig();

  const baseConfig = {
    axisLine: {
      show: true,
      lineStyle: {
        color: colors.borderLight,
        width: 1
      }
    },
    axisTick: { show: false },
    axisLabel: {
      color: colors.textSecondary,
      fontSize: 12
    },
    splitLine: {
      show: axisType === 'value',
      lineStyle: {
        color: colors.borderLight,
        type: 'dashed',
        width: 1
      }
    }
  };

  if (axisType === 'category') {
    return {
      ...baseConfig,
      type: 'category',
      data: options.data || [],
      axisLabel: {
        ...baseConfig.axisLabel,
        rotate: options.rotate || 0,
        interval: options.interval || 0
      }
    };
  }

  return {
    ...baseConfig,
    type: 'value',
    name: options.name || '',
    nameTextStyle: {
      color: colors.textSecondary,
      fontSize: 12,
      padding: [0, 0, 0, 0]
    },
    min: options.min,
    max: options.max
  };
}

export function getBarItemStyle(value, index, topIndices, colors) {
  const isTop = topIndices.includes(index);

  if (isTop) {
    return {
      color: colors.danger,
      borderRadius: [0, 4, 4, 0]
    };
  }

  return {
    color: colors.primary,
    borderRadius: [0, 4, 4, 0]
  };
}

export function getPieItemStyle(value, name, colors) {
  const isSafe = name === '安全';
  const baseColor = isSafe ? colors.success : colors.danger;

  return {
    color: baseColor
  };
}

export function getScatterItemStyle(value, colors) {
  return {
    opacity: 0.85,
    shadowBlur: 4,
    shadowColor: 'rgba(0, 0, 0, 0.1)'
  };
}

export function getLegendConfig(colors, options = {}) {
  return {
    orient: options.orient || 'horizontal',
    left: options.left || 'center',
    top: options.top || 'top',
    textStyle: {
      color: colors.textSecondary,
      fontSize: 12
    },
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16
  };
}

export function getVisualMapConfig(colors, options = {}) {
  return {
    show: true,
    orient: 'vertical',
    left: 'left',
    bottom: '10%',
    min: options.min || 0,
    max: options.max || 1,
    text: ['高', '低'],
    textStyle: {
      color: colors.textSecondary,
      fontSize: 12
    },
    inRange: {
      color: ['#E0E7FF', '#6366F1', '#4F46E5']
    },
    calculable: true
  };
}

export function getBoxplotStyle(colors) {
  return {
    itemStyle: {
      color: 'rgba(99, 102, 241, 0.1)',
      borderColor: colors.primary,
      borderWidth: 2
    },
    lineStyle: {
      color: colors.primary,
      width: 2
    },
    upperLabel: { show: false },
    medianStyle: {
      color: colors.primary,
      width: 3
    },
    emphasis: {
      itemStyle: {
        borderColor: colors.primaryHover,
        borderWidth: 3
      }
    }
  };
}

export default {
  CHART_COLORS,
  getChartConfig,
  getLightTooltip,
  getGridConfig,
  getAxisConfig,
  getBarItemStyle,
  getPieItemStyle,
  getScatterItemStyle,
  getLegendConfig,
  getVisualMapConfig,
  getBoxplotStyle
};
