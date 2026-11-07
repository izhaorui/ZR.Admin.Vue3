import * as echarts from 'echarts/core'
import 'echarts-wordcloud/src/wordCloud'
import { BarChart, GaugeChart, LineChart, LinesChart, MapChart, PieChart, RadarChart, ScatterChart } from 'echarts/charts'
import {
  AriaComponent,
  DataZoomComponent,
  DatasetComponent,
  GeoComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  AriaComponent,
  BarChart,
  CanvasRenderer,
  DataZoomComponent,
  DatasetComponent,
  GaugeChart,
  GeoComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  LinesChart,
  MapChart,
  MarkLineComponent,
  MarkPointComponent,
  PieChart,
  RadarChart,
  ScatterChart,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent
])

export { echarts }
