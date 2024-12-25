<template>
  <el-dialog v-model="dialogVisible" title="Steam转离线模式使用教程" width="80%" class="rules-dialog"
    @update:modelValue="handleVisibleChange">
    <div class="rules-dialog-content">
      <div class="rules-section">
        <h3>第一步：安装Steam客户端</h3>
        <div class="rules-text">
          <p>1. 首先安装Steam平台客户端</p>
          <p>2. 可以通过Steam官网下载，或使用以下网盘链接：</p>
          <p class="link">https://pan.baidu.com/s/1smqAgUD</p>
        </div>
      </div>

      <div class="rules-section">
        <h3>第二步：登录账号</h3>
        <div class="rules-text">
          <p>1. 启动Steam客户端</p>
          <p>2. 输入提供的账号和密码</p>
          <p>3. 使用令牌进行验证登录</p>
        </div>
      </div>

      <div class="rules-section">
        <h3>第三步：下载游戏</h3>
        <div class="rules-text">
          <p>1. 进入Steam界面，点击左上角"库"</p>
          <p>2. 在游戏列表中选择要下载的游戏</p>
          <p>3. 点击安装开始下载</p>
          <p>4. 首次运行游戏以激活本地模式</p>
          <div class="image-gallery">
            <div class="image-item">
              <img src="../../img/steam/1.png" alt="Steam库界面" @click="handleImageClick">
              <p class="image-caption">Steam库界面</p>
            </div>
            <div class="image-item">
              <img src="../../img/steam/2.png" alt="游戏下载界面" @click="handleImageClick">
              <p class="image-caption">游戏下载界面</p>
            </div>
            <div class="image-item">
              <img src="../../img/steam/3.png" alt="首次运行游戏" @click="handleImageClick">
              <p class="image-caption">首次运行游戏激活本地模式</p>
            </div>
          </div>



        </div>
      </div>

      <div class="rules-section highlight">
        <h3>第四步：设置离线模式（重要）</h3>
        <div class="rules-text">
          <p>为什么要设置离线模式？</p>
          <ul>
            <li>共享账号不能同时在线游戏</li>
            <li>避免顶号和存档损坏</li>
            <li>防止账号被踢出需要重新认证</li>
          </ul>
          <p>设置步骤：</p>
          <ol>
            <li>点击Steam菜单</li>
            <li>选择离线模式</li>
            <li>确认进入离线模式</li>
          </ol>
          <p class="warning">注意：每次启动Steam都需要选择"以离线模式启动"</p>
        </div>

        <div class="image-gallery">
          <div class="image-item">
            <img src="../../img/steam/4.png" alt="已成功进入离线模式" @click="handleImageClick">
            <p class="image-caption">已成功进入离线模式</p>
          </div>
          <div class="image-item">
            <img src="../../img/steam/5.png" alt="选择离线模式启动" @click="handleImageClick">
            <p class="image-caption">选择离线模式启动</p>
          </div>

        </div>

      </div>

      <div class="rules-section">
        <h3>第五步：多账号切换说明</h3>
        <div class="rules-text">
          <p>1. 点击右上角游戏手柄图标</p>
          <p>2. 选择启用Steam大屏幕模式</p>
          <p>3. 在大屏幕模式下注销账号</p>
          <p>4. 选择添加新账号或切换已有账号</p>
          <p class="warning">重要提示：切换账号必须使用大屏幕模式！普通模式注销后需要重新验证！</p>
        </div>

        <div class="image-gallery">
          <div class="image-item">
            <img src="../../img/steam/6.png" alt="进入大屏幕模式" @click="handleImageClick">
            <p class="image-caption">进入大屏幕模式</p>
          </div>
          <div class="image-item">
            <img src="../../img/steam/7.png" alt="注销用户" @click="handleImageClick">
            <p class="image-caption">注销用户</p>
          </div>
          <div class="image-item">
            <img src="../../img/steam/8.png" alt="选择自己的账户" @click="handleImageClick">
            <p class="image-caption">选择自己的账户</p>
          </div>

        </div>

      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="showPreview" width="90%" append-to-body destroy-on-close :show-close="true"
      class="preview-dialog">
      <img :src="previewImage" class="preview-image" alt="预览图">
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 图片预览状态
const showPreview = ref(false)
const previewImage = ref('')

// 图片点击处理
const handleImageClick = (event) => {
  previewImage.value = event.target.src
  showPreview.value = true
}

const handleVisibleChange = (value) => {
  emit('update:visible', value)
}
</script>

<style scoped>
/* 主对话框居中样式 */
.rules-dialog :deep(.el-dialog) {
  margin: 0 !important;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 80% !important;
  max-width: 1200px;
  background: white;
  border-radius: 8px;
  z-index: 2000;
}

/* 确保遮罩层覆盖整个屏幕并居中内容 */
.rules-dialog :deep(.el-overlay) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 调整内容区域布局 */
.rules-dialog-content {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 调整每个部分的布局 */
.rules-section {
  margin: 0;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rules-section.highlight {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
}

.rules-section h3 {
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rules-text {
  color: var(--text-secondary);
  line-height: 1.6;
}

.rules-text p {
  margin: 10px 0;
}

.rules-text .link {
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
}

.rules-text .warning {
  color: #f56c6c;
  font-weight: 500;
  margin: 15px 0;
  padding: 10px;
  background: rgba(245, 108, 108, 0.1);
  border-radius: 4px;
}

.rules-text ul, .rules-text ol {
  padding-left: 20px;
  margin: 10px 0;
}

.rules-text li {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .rules-dialog :deep(.el-dialog) {
    width: 95% !important;
    height: auto;
    max-height: 95vh;
  }
  
  .rules-dialog :deep(.el-dialog__body) {
    max-height: calc(95vh - 100px);
    padding: 15px;
  }
  
  .rules-dialog-content {
    padding: 10px;
    gap: 15px;
  }
  
  .rules-section {
    padding: 15px;
    gap: 10px;
  }
  
  .rules-section h3 {
    font-size: 16px;
  }
  
  .rules-text {
    font-size: 14px;
  }
}

 .image-gallery {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
     gap: 20px;
     margin: 15px 0;
 }

 .image-item {
     text-align: center;
 }

 .image-item img {
     width: 100%;
     max-width: 300px;
     border-radius: 8px;
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
     cursor: pointer;
     transition: transform 0.3s ease;
 }

 .image-item img:hover {
     transform: scale(1.02);
 }

 .image-caption {
     margin-top: 8px;
     color: #666;
     font-size: 14px;
 }

 /* 图片预览对话框样式 */
 .preview-dialog :deep(.el-dialog) {
     position: fixed;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     margin: 0 !important;
     padding: 0;
     background: transparent;
     box-shadow: none;
     width: 90% !important;
     max-width: 1600px;
     display: flex;
     justify-content: center;
     align-items: center;
     z-index: 2001;
 }

 /* 图片预览遮罩层 */
 .preview-dialog :deep(.el-overlay) {
     position: fixed;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background-color: rgba(0, 0, 0, 0.9);
     z-index: 2000;
 }

 /* 优化预览图片容器 */
 .preview-dialog :deep(.el-dialog__body) {
     padding: 0;
     margin: 0;
     height: 90vh;
     display: flex;
     justify-content: center;
     align-items: center;
 }

 /* 优化预览图片 */
 .preview-image {
     max-width: 95%;
     max-height: 95vh;
     object-fit: contain;
     border-radius: 8px;
     box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
 }

 .image-item img {
     cursor: pointer;
     transition: transform 0.2s;
 }

 .image-item img:hover {
     transform: scale(1.05);
 }

 @media (max-width: 768px) {
     .rules-dialog :deep(.el-dialog) {
         width: 95% !important;
         height: auto;
         max-height: 95vh;
     }
     
     .rules-dialog :deep(.el-dialog__body) {
         max-height: calc(95vh - 100px);
         padding: 15px;
     }
     
     .image-gallery {
         grid-template-columns: 1fr;
     }
     
     .image-item img {
         max-width: 100%;
     }
 }

</style> 