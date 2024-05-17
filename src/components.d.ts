import SvgIcon from '@/components/SvgIcon/index.vue'
import UploadImage from '@/components/ImageUpload.vue'
import UploadFile from '@/components/FileUpload'
import ImagePreview from '@/components/ImagePreview'
import DictTag from '@/components/DictTag'
import Dialog from '@/components/Dialog'
import MyTable from '@/components/MyTable'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
		SvgIcon: typeof SvgIcon,
		UploadImage: typeof UploadImage,
		DictTag: typeof DictTag,
		ImagePreview: typeof ImagePreview,
		UploadFile: typeof UploadFile,
		ZrDialog: typeof Dialog,
		MyTable: typeof MyTable
  }
}