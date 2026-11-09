import { computed, reactive, ref } from 'vue'
import { delSysfile, listSysfileByGroup, moveFileGroup, updateSysfile } from '@/api/tool/file'
import { treelistFileGroup } from '@/api/tool/filegroup.js'

export function useImageLibrary() {
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 15,
    categoryId: undefined,
    realName: ''
  })
  const form = reactive({
    categoryId: 0
  })
  const categories = ref([])
  const total = ref(0)
  const uploadedImages = ref([])
  const loading = ref(false)
  const moveGroupOptions = computed(() => categories.value.filter((item) => item.groupId !== 0))

  const getList = async () => {
    loading.value = true
    try {
      const response = await listSysfileByGroup(queryParams)
      if (response.code === 200) {
        uploadedImages.value = response.data?.result || []
        total.value = response.data?.totalNum || 0
      }
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    const response = await treelistFileGroup()
    categories.value = [
      {
        groupId: 0,
        groupName: '全部'
      },
      {
        groupId: -1,
        groupName: '未分类'
      },
      ...(response.data || [])
    ]
  }

  const resetForOpen = () => {
    queryParams.pageNum = 1
    queryParams.realName = ''
  }

  const selectCategory = (category) => {
    form.categoryId = category.groupId
    queryParams.categoryId = category.groupId
    queryParams.pageNum = 1
    getList()
  }

  const search = () => {
    queryParams.pageNum = 1
    getList()
  }

  const findImageById = (id) => uploadedImages.value.find((image) => image.id === id)

  const moveFiles = (groupId, ids) => {
    return moveFileGroup({ groupId, ids })
  }

  const deleteFile = (id) => {
    return delSysfile(id)
  }

  const updateFileName = async (image, realName) => {
    await updateSysfile({ ...image, realName })
    image.realName = realName
  }

  return {
    categories,
    deleteFile,
    findImageById,
    form,
    getList,
    loadCategories,
    loading,
    moveFiles,
    moveGroupOptions,
    queryParams,
    resetForOpen,
    search,
    selectCategory,
    total,
    updateFileName,
    uploadedImages
  }
}
