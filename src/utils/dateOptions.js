// dayjs 参考：https://www.cnblogs.com/Airon-wei/p/14362160.html
import dayjs from 'dayjs'

const dateOptions = [
  {
    text: '昨天',
    value: () => {
      const start = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      const end = start + ' 23:59:59'

      return [start, dayjs(end).toISOString()]
    }
  },
  {
    text: '今天',
    value: () => {
      const start = dayjs().format('YYYY-MM-DD')
      const end = start + ' 23:59:59'

      return [start, end]
    }
  },
  {
    text: '本周',
    value: () => {
      const end = dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD') + ' 23:59:59'
      const start = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')
      return [start, end]
    }
  },
  {
    text: '上周',
    value: () => {
      const start = dayjs().add(-1, 'week').startOf('week').add(1, 'day').format('YYYY-MM-DD')
      const end = dayjs().add(-1, 'week').endOf('week').add(1, 'day').format('YYYY-MM-DD') + ' 23:59:59'
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = dayjs().endOf('month').format('YYYY-MM-DD')
      const start = dayjs().startOf('month').format('YYYY-MM-DD')

      return [start, end + ' 23:59:59']
    }
  },
  {
    text: '上月',
    value: () => {
      const end = dayjs().startOf('month').format('YYYY-MM-DD')
      const start = dayjs().add(-1, 'month').startOf('month').format('YYYY-MM-DD')

      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = dayjs().format('YYYY-MM-DD') + ' 23:59:59'
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [dayjs(start).format('YYYY-MM-DD'), end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = dayjs().format('YYYY-MM-DD') + ' 23:59:59'
      // const start = new Date()
      //start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [dayjs().day(-30).format('YYYY-MM-DD'), end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = dayjs().format('YYYY-MM-DD') + ' 23:59:59'
      // const start = new Date()
      // start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [dayjs().day(-90).format('YYYY-MM-DD'), end]
    }
  }
]
export default dateOptions
