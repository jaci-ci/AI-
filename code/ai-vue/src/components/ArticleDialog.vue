<template>
    <el-dialog
        :title=" isEdit? '编辑文章' : '新增文章' "
        v-model="dialogVisible"
        width="50%"
        @close="handleClose"
    >
        <el-form ref="formRef" :rules="rules" :model="formData" label-width="120px">
            <el-form-item label="文章标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable></el-input>
            </el-form-item>
            <el-form-item label="所属分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择所属分类">
                    <el-option v-for="item in props.categories" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="文章摘要" prop="summary">
                <el-input type="textarea" v-model="formData.summary"  placeholder="请输入文章摘要(可选)" maxlength="1000" show-word-limit :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
                <el-select v-model="formData.tagArray" placeholder="请输入文章标签(多个标签用逗号隔开)" multiple filterable allow-create width="100%">
                    <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片">
                <div class="cover-upload">
                    <el-upload
                        class="avatar-uploader"
                        action="#"
                        :before-upload="beforerUpload"
                        :http-request="handleUploadRequest"
                        accept="image/*"
                        :show-file-list="false"
                        >
                        <div class="cover-placeholder" v-if="!imgUrl">
                            <p>点击上传封面</p>
                        </div>
                        <img v-else :src="imgUrl" alt="封面图片" class="cover-image">
                    </el-upload>
                    <div v-if="imgUrl" class="cover-remove">
                        <el-button type="danger" size="mini" @click="handleRemove">移除封面</el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
                <RichTextEditor 
                    v-model:modelValue="formData.content"
                    placeholder="请输入文章内容，支持富文本格式"
                    maxCharCount="5000"
                    @change="handleContentChange"
                    @created="handleEditorCreated"
                    minHeight="400px"
                    />
            </el-form-item>
        </el-form>
        <div v-if="btnPreview">
            <h3>内容预览</h3>
            <div v-html="formData.content"></div>
        </div>
        <template #footer>
            <el-button  @click="btnPreview = !btnPreview">{{btnPreview ? '关闭预览' : '预览效果'}}</el-button>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{isEdit? '更新文章' : '创建文章'}}</el-button>
        </template>
    </el-dialog>
</template>
<script setup>
// 导入Vue相关API
import { ref, reactive,computed,nextTick,watch } from 'vue'
// 导入Element Plus的消息提示组件
import { ElMessage } from 'element-plus'
// 导入API接口函数
import { uploadFile, createArticle, updateArticle } from '../api/admin'
// 导入文件基础URL配置
import { fileBaseUrl } from '../config/index.js'
// 导入富文本编辑器组件
import RichTextEditor from '../components/RichTextEditor.vue'

/**
 * 关闭对话框的处理函数
 * 重置表单、清空业务ID、清空标签数组、移除封面图片
 */
const handleClose = () => {
    formRef.value.resetFields()
    businessId.value = null
    formData.tagArray = []
    handleRemove()
    emit('update:modelValue', false)
}
 
// 定义组件的props属性
const props = defineProps({
    // 对话框的显示/隐藏状态，使用v-model双向绑定
    modelValue: {
        type: Boolean,
        default: false
    },
    // 文章分类列表
    categories: {
        type: Array,
        default: () => []
    },
    // 要编辑的文章对象（编辑模式下传入）
    article: {
        type: Object,
        default: null
    }
})
 
// 定义组件可以触发的事件
const emit = defineEmits(['update:modelValue','success'])

// 计算属性：对话框的显示状态，支持v-model双向绑定
const dialogVisible= computed({
    get() {
        return props.modelValue
    },
    set(val){
        emit('update:modelValue', val)
    }
})

// 计算属性：判断是否为编辑模式（根据article对象是否有id）
const isEdit = computed(() => !! props.article?.id )
 
// 监听article属性的变化，当传入文章对象时，填充表单数据
watch(() => props.article, (newVal) =>{
    if(newVal){
        // 使用nextTick确保DOM更新后再执行
        nextTick(() =>{
        // 将文章数据复制到表单数据中
        Object.assign(formData, newVal)
        // 设置业务ID
        businessId.value = newVal.id
        // 设置封面图片URL
        imgUrl.value = fileBaseUrl + newVal.coverImage
        })
    }
})
 
// 表单数据的响应式对象
const formData = reactive({
    "title": "",           // 文章标题
    "content": "",         // 文章内容
    "coverImage": "",      // 封面图片路径
    "categoryId": 1,       // 文章分类ID
    "summary": "",         // 文章摘要
    "tags": "",            // 文章标签（逗号分隔的字符串）
    "id": ""               // 文章ID
})
 
// 常用标签列表，用于下拉选择
const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠', 
  '冥想', '正念', '放松', '知识管理', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]
 
// 表单验证规则
const rules = reactive({
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
    ],
    categoryId: [
        { required: true, message: '请选择所属分类', trigger: 'change' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' },
        { min: 1, max: 5000, message: '长度最多5000个字符', trigger: 'blur' }
    ],
})
 
// 封面图片的URL
const imgUrl = ref('')

/**
 * 上传前的验证函数
 * @param {File} file - 要上传的文件对象
 * @returns {boolean} - 验证是否通过
 */
const beforerUpload = (file) => {
    // 检查文件大小是否小于5MB
    const isLt5M = file.size / 1024 / 1024 < 5
    // 检查是否为图片文件
    const isImage = file.type.startsWith('image/')
    if(!isImage){
        ElMessage.error('请上传图片文件')
        return false
    }
    if(!isLt5M){
        ElMessage.error('图片大小不能超过5M')
        return false
    }
    return true 
}
 
// 业务ID，用于标识上传的文件
const businessId = ref(null)

/**
 * 处理文件上传请求
 * @param {Object} param0 - 包含file参数的对象
 */
const handleUploadRequest =async ({file}) =>{
    // 生成唯一的业务ID
    businessId.value = crypto.randomUUID()
    // 调用上传API
    const fileRes = await uploadFile(file,{
        businessId: businessId.value,
    })
    // 设置图片预览URL
    imgUrl.value = fileBaseUrl + fileRes.filePath
    // 保存文件路径到表单数据
    formData.coverImage = fileRes.filePath
}
 
/**
 * 移除封面图片
 * 清空图片URL和表单中的封面图片路径
 */
const handleRemove = () => {
    imgUrl.value = ''
    formData.coverImage = ''
}
 
/**
 * 富文本编辑器内容变化回调
 * @param {Object} data - 包含html内容的数据对象
 */
const handleContentChange = (data) => {
    formData.content = data.html;
}

// 富文本编辑器实例
const editorInstance = ref(null)

/**
 * 富文本编辑器创建完成回调
 * @param {Object} editor - 编辑器实例
 */
const handleEditorCreated = (editor) => {
    editorInstance.value = editor
    // 如果有初始内容，设置到编辑器中
    if(formData.content && editor){
        nextTick(() => {
            editor.setHtml(formData.content)
        })
    }
}
 
// 控制预览按钮的显示状态
const btnPreview = ref(false)

// 提交按钮的加载状态
const loading = ref(false)
// 表单引用
const formRef = ref()

/**
 * 提交表单的处理函数
 * 验证表单后，根据是新增还是编辑模式调用不同的API
 */
const handleSubmit = () => {
    // 验证表单
    formRef.value.validate((valid,fileds) =>{
        if(!valid){
            return
        }
        loading.value = true
        // 准备提交数据，将标签数组转换为逗号分隔的字符串
        const submitData = {
            ...formData,
            tags: formData.tagArray.join(',')
        }
        // 删除临时属性tagArray
        delete submitData.tagArray

        // 判断是新增还是编辑
        if(!isEdit.value){
            // 新增模式：使用业务ID作为文章ID
            submitData.id = businessId.value
            createArticle(submitData).then(res => {
                loading.value = false
                emit('success')
            })
        }else{
            // 编辑模式：使用原文章ID更新
            updateArticle(props.article.id,submitData).then(res =>{
                loading.value = false
                emit('success')
            })
        }
    })
}
</script>
<style lang="scss" scoped>
.cover-placeholder{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 120px;
    color: #999;
    background-color: #f5f5f5;
    flex-direction: column;
}
.cover-image{
    width: 200px;
    height: 120px;
    display: block;
}
</style>
