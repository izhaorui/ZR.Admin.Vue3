import SvgIcon from '@/components/SvgIcon/index.vue'
import UploadImage from '@/components/ImageUpload.vue'
import FileUpload from '@/components/FileUpload'
import ImagePreview from '@/components/ImagePreview'
import DictTag from '@/components/DictTag'
import Dialog from '@/components/Dialog'
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
		SvgIcon: typeof SvgIcon,
		UploadImage: typeof UploadImage,
		DictTag: typeof DictTag,
		ImagePreview: typeof ImagePreview,
		FileUpload: typeof FileUpload,
		ZrDialog: typeof Dialog
  }
}