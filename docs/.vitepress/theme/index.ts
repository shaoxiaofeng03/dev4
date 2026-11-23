import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';

import TodayPanel from './components/TodayPanel.vue';
import WeekTasks from './components/WeekTasks.vue';
import DayLog from './components/DayLog.vue';
import WeekReview from './components/WeekReview.vue';
import Heatmap from './components/Heatmap.vue';
import CheckinDashboard from './components/CheckinDashboard.vue';
import FlashCards from './components/FlashCards.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TodayPanel', TodayPanel);
    app.component('WeekTasks', WeekTasks);
    app.component('DayLog', DayLog);
    app.component('WeekReview', WeekReview);
    app.component('Heatmap', Heatmap);
    app.component('CheckinDashboard', CheckinDashboard);
    app.component('FlashCards', FlashCards);
  },
} satisfies Theme;
