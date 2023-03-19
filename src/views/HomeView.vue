<template>
  <div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="主页" name="first">
       <div class="bang_time">
         <!-- <img class="ti_img" src="@/assets/img/1.png" alt=""> -->
         <div class="ti_img">
        <h1>室内行人轨迹预测系统</h1>
         </div>
        <div class="ti_button" @click="ong">进入系统</div>
       </div>
       
      </el-tab-pane>
    <el-tab-pane label="团队介绍" name="second">
      <div class="we">
        <img src="@/assets/img/3.png">
      </div>
      <div class="word">
        <h2>团队成员介绍</h2>
        <p>王琦：负责数据库与后端开发</p>
        <p>张泽宇：负责算法实现</p>
        <p>刘笑言：负责前端开发</p>
      </div>
    </el-tab-pane>

  </el-tabs>

  </div>
</template>

<script>
import {login} from '../../utils/api.js'
export default {
   name:'login',
    data() {
      return {
        activeName: 'first'
      };
    },
     methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      },
      ong(){
        this.$router.push('/about')
      }
    }
}
</script>

<style lang="less" scoped>
/deep/   .el-tabs__nav{
   position: relative;
   left: 20%;
 
 }
 /deep/.el-tabs__item{
  font-size: 24px;
 }
.bang_time{
  width: 100%;
  height:600px;

}
 .ti_img{
    width: 100%;
    height: 490px;
    background-color: #2980e1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 35px;
  }
  .ti_button{
    width: 150px;
    height: 50px;
    border-radius: 10px;
    text-align:center;
    line-height: 50px;
    background: cornflowerblue;
    margin: 0 auto;
    color: cornsilk;
    cursor: pointer;
    margin-top: 20px;
  }
  .we{
    width: 1000px;
    height: 750px;
    display: flex;
    text-align: center;
    margin: auto;
    margin-right: auto;
    // align-items: center;
    // justify-content: center;
  }
  .word{
    position: relative;
    text-align: center;
    margin: auto;
    // text-align: right;
    font-size: 40px;
  }
</style>