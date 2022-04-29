// dayjs 参考：https://www.cnblogs.com/Airon-wei/p/14362160.html
import dayjs from 'dayjs'

const dateOptions = [
{
  text: '昨天',
  value: () => {
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24);
    end.setTime(end.getTime() - 3600 * 1000 * 24);
    // console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    return [start, end]
  }
},
{
  text: '本周',
  value: () => {
    const end = dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD');
    const start = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')
    return [start, end]
  }
},
{
  text: '上周',
  value: () => {
    const start = dayjs().add(-1, 'week').startOf('week').add(1, 'day').format('YYYY-MM-DD')
    const end = dayjs().add(-1, 'week').endOf('week').add(1, 'day').format('YYYY-MM-DD')
    return [start, end]
  }
},
{
  text: '本月',
  value: () => {
    const end = dayjs().endOf('month').format('YYYY-MM-DD')
    const start = dayjs().startOf('month').format('YYYY-MM-DD')

    return [start, end]
  },
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
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
    return [start, end]
  },
},
{
  text: '最近一个月',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
    return [start, end]
  },
},
{
  text: '最近三个月',
  value: () => {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
    return [start, end]
  },
}]
export default dateOptions