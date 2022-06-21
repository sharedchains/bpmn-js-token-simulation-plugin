import ChartBarSVG from './chart-bar.svg';

function createIcon(svg) {
  return function Icon(className = '') {
    return `<span class="bts-icon ${ className }">${svg}</span>`;
  };
}

export const ChartBarIcon = createIcon(ChartBarSVG);