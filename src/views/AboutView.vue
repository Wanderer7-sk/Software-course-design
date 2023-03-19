<template>
  <div class="hor_time">
    <div class="le_header">
      <img alt src="@/assets/img/2.png" @click="gohome()"/>
      <div>
        <el-upload
            :before-remove="beforeRemove"
            :file-list="modeList"
            :http-request="modeUpload"
            :limit="3"
            :data="uploadData"
            :on-change="handleChange"
            :on-exceed="handleExceed"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            accept=".csv"
            action="https://jsonplaceholder.typicode.com/posts/"
            class="upload-demo"
            multiple
        >
          <div class="button_dao" @click="changeMode(1)">导入数据groundtruth</div>
          <div class="button_dao" @click="changeMode(2)">导入数据position</div>
          <div class="button_dao" @click="changeMode(3)">导入数据running</div>

        </el-upload>
        <input type = "number" v-model = "batch">
        <button class="button_dao" @click="compute_hold">平持计算</button>
        <button class="button_dao" @click="compute_swing">摇摆计算</button>
      </div>
    </div>
    <div class="body_time">
      <div class="body_left">
        <div class="body_left_tw">轨迹展示区
          <div class="bg">
            <canvas id="mycanvas" height="800" width="1000" @mousedown="setPoint"></canvas>
          </div>
        </div>
        <div class="num_time">
          <div
              v-for="(item,index) in list"
              :key="index"
              class="onhot"
              @click="onbos(index)"
          ><span :class="idIndex==index?'active':''">{{ item }}</span></div>
        </div>
      </div>
      <div class="rightBox">
        <div class="body_right">误差展示区
          <div id="main" style="width: 600px;height: 400px;"></div>
        </div>
        <div class="aa">50%误差：{{ error50 }}</div>
        <div class="aa">75%误差：{{ error75 }}</div>
        <div class="aa">90%误差：{{ error90 }}</div>
        <div class="aa">平均误差：{{ errorAve }}</div>
        <div v-if="pos?.x" class="body_right_btom">
          <ul>
            <li>
              <span>X:</span>{{ pos.x }}
            </li>
            <li>
              <span>Y:</span>{{ pos.y }}
            </li>
            <li>
              <span>accx:</span>{{ pos.accx }}
            </li>
            <li>
              <span>accy:</span>{{ pos.accy }}
            </li>
            <li>
              <span>gyrx:</span>{{ pos.gyrx }}
            </li>
            <li>
              <span>gyry:</span>{{ pos.gyry }}
            </li>
            <li>
              <span>sampleBatch:</span>{{ pos.sampleBatch }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {query, query_position,cmpt_hold,cmpt_swing,query_position_file} from '../../utils/api.js'
import axios from "axios";
import * as echarts from "echarts";
// query().then(res => {console.log(res)})
// query().then(res => {console.log(res.data)})
export default {
  data() {
    return {
      pos: {},
      fileTemp: null,
      fileListUpload: [],
      tableData: [],
      list: [1, 2, 3, 4, 5, 6],
      mode: {},
      modeList: [],
      updateData:null,
      canvas: null,
      ctx: null,
      idIndex: null,
      fileList: [],
      charts: '',
      opinionData: ['0', '0.16', '0.31', '0.45', '0.54', '0.64', '0.73', '0.80', '0.88', '0.90', '0.93', '0.95', '0.96', '0.97', '0.98'],
      xdata: [-1, -1, -1, -1, -1, -1, -0.6, 0.2, 1.2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,],
      ydata: [3.4, 2.2, 1, -0.2, -1.4, -2.6, -3.2, -3.2, -3.2, -2.6, -1.4, -0.2, 1, 2.2, 3.4],
      mockData: [],
      position: [],
      batchc:null,
      error:[],
      myChart:[],
      error50:0,
      error75:0,
      error90:0,
      errorAve:0,
      ldata: [{
        "label": "groundTruth",
        "color": "red"
      }, {
        "label": "直接定位曲线",
        "color": "blue"
      }, {
        "label": "预测曲线",
        "color": "black"
      }]
    };
  },
  mounted() {
    this.$nextTick(function () {
          // this.drawLine("main");
    this.drawLine();
    }
    );
    var chartDom = document.getElementById('main');
    this.myChart = echarts.init(chartDom);
    var option;

    option = {
      xAxis: {
      },
      yAxis: {
      },
      series: [
        {
          data: this.error,
          // data:[
          //     [1,2],
          //     [25,667]
          // ],
          type: 'line'

        }
      ]
    };
    console.log("mycharts");
    this.myChart.setOption(option,true);
  },
  methods: {
    // getData() {
    //             axios.get('/api/test.json').then(response => {
    //                 console.log(response.data);
    //                    this.opinionData =response.data.data;
    //                     this.drawLine('main')
    //             }, response => {
    //                 console.log("error");
    //             });
    //         },
    compute_hold(){
      cmpt_hold(this.batch).then(res => {
        console.log("this is predict data")
        console.log(res);
        this.mockData = res;

        query_position_file(this.batch).then(res => {
          console.log("this is position data")
          console.log(res);
          this.positon = res;
          this.updateError();
          this.clearCanvas(),
          this.drawLine(),
          this.doDraw()
        })

          }

      )
    },

    compute_swing(){
      cmpt_swing(this.batch).then(res => {
            console.log("this is predict data")
            console.log(res);
            this.mockData = res;

            query_position_file(this.batch).then(res => {
              console.log("this is position data")
              console.log(res);
              this.positon = res;
              this.updateError();
              this.clearCanvas(),
                  this.drawLine(),
                  this.doDraw()
            })

          }

      )
    },

    changeMode(mode){
      this.updateData = mode;
    },
    updateError(){
      this.error=[];
      var sorted = [];
      for(let i = 0;i < this.mockData.length;i++){
        sorted.push(this.mockData[i].error);
      }
      sorted.sort(function (a,b){
        return a-b;
      });
      this.error50 = (sorted[7]+sorted[7])/2;
      this.error75 = sorted[10];
      this.error90 = (sorted[12]+sorted[12])/2;
      this.errorAve = sorted.reduce((a, b) => a + b) / sorted.length;
      for(let i = 0;i < this.mockData.length;i++){
        this.error.push([sorted[i],(i+1)/this.mockData.length]);
      }
      console.log(this.error);
      var option = {
        xAxis: {
        },
        yAxis: {
        },
        series: [
          {
            data: this.error,
            type: 'line'
          }
        ]
      };
      this.myChart.setOption(option,true);
    },
    getData() {
      console.log("in getdata");
      query(this.idIndex + 27).then(res => {
        console.log("in query"),
        console.log(res),
        // this.mockData.x = res.data['x'],
        // this.mockData.y = res.data['y'],
        // this.mockData.xtrue = res.data['xtrue'],
        // this.mockData.y = res.data['y'],
        this.mockData = res;
        this.updateError();
        query_position(this.idIndex + 27).then(res => {
          this.positon = res;

          this.clearCanvas();
          this.drawLine();
          this.doDraw();
        })
        console.log(this.mockData)
      })


    },

    drawLine() {
      this.canvas = document.getElementById('mycanvas');
      if (!this.canvas) {
        return false;
      } else {
        this.ctx = this.canvas.getContext('2d');
        this.ctx.setLineDash([8]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.xdata[0] * 73 + 397, 383 - 64 * this.ydata[0]);
        for (let i = 1; i < this.xdata.length; i++) {
          let x = this.xdata[i] * 73 + 397;
          let y = 383 - 64 * this.ydata[i];
          this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        for (let i = 0; i < this.xdata.length; i++) {
          this.ctx.beginPath();
          this.ctx.fillStyle = 'red';
          this.ctx.strokeStyle = "white";
          let x = this.xdata[i] * 73 + 397;
          let y = 383 - 64 * this.ydata[i];
          this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
          this.ctx.stroke();
          this.ctx.fill();
        }
      }
    },
    //   this.charts = echarts.init(document.getElementById(id));
    //   this.charts.setOption({
    //     tooltip: {
    //       trigger: "axis",
    //     },
    //     legend: {
    //       data: ["误差曲线"],
    //     },
    //     grid: {
    //       left: "3%",
    //       right: "4%",
    //       bottom: "3%",
    //       containLabel: true,
    //     },
    //
    //     toolbox: {
    //       feature: {
    //         saveAsImage: {},
    //       },
    //     },
    //     xAxis: {
    //       type: "category",
    //       boundaryGap: false,
    //       data: ["0.06","0.14", "0.21", "0.23", "0.27", "0.34","0.41","0.46","0.57","0.64","0.68","0.78","0.83","0.91","0.94"],
    //     },
    //     yAxis: {
    //       type: "value",
    //     },
    //
    //     series: [
    //       {
    //         name: "误差曲线",
    //         type: "line",
    //         stack: "比例",
    //         data: this.opinionData,
    //       },
    //     ],
    //   });

    doDraw() {

      // xy
      // let arr = JSON.parse(JSON.stringify(this.da));
      // let arr = this.da;

      console.log(this.mockData);
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.mockData[0].x * 73 + 397, 383 - 64 * this.mockData[0].y);
      for (let i = 1; i < this.mockData.length; i++) {
        let x = this.mockData[i].x * 73 + 397;
        let y = 383 - 64 * this.mockData[i].y;
        this.ctx.lineTo(x, y);
      }
      this.ctx.strokeStyle = "black";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      for (let i = 0; i < this.mockData.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.strokeStyle = "white";
        let x = this.mockData[i].x * 73 + 397;
        let y = 383 - 64 * this.mockData[i].y;
        this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
      }
      // xtrue y
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.positon[0].x * 73 + 397, 383 - 64 * this.positon[0].y);
      console.log(this.position);
      for (let i = 1; i < this.positon.length; i++) {
        let x = this.positon[i].x * 73 + 397;
        let y = 383 - 64 * this.positon[i].y;
        this.ctx.lineTo(x, y);
      }
      this.ctx.strokeStyle = "blue";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      for (let i = 0; i < this.positon.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillStyle = 'blue';
        this.ctx.strokeStyle = "white";
        let x = this.positon[i].x * 73 + 397;
        let y = 383 - 64 * this.positon[i].y;
        this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
      }
      let legendData = this.ldata;
      let interval = 20;
      for (let i = 0; i < legendData.length; i++) {
        let _color = legendData[i];
        this.ctx.fillStyle = _color.color;
        this.ctx.fillRect(950, 8+i * interval, 40, 16);
        this.ctx.fillStyle = "black";
        this.ctx.font = 'normal 24px 黑体';
        this.ctx.fillText(_color.label, 800, 24 + i * interval);

      }
    },

    setPoint(event) {
      let pos = {
        x: event.clientX,
        y: event.clientY
      }
      console.log(pos);
      for (let i = 0; i < this.mockData.length; i++) {
        let x = this.mockData[i].x * 73 + 397;
        let y = 383 - 64 * this.mockData[i].y;
        if (Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2)) < 27) {
          this.pos = this.mockData[i];
        }
      }
      // let off= this.mockData.some(res=>{
      //   return (res.x* 73 + 397)-10<=(pos.x - 20)&&(pos.x - 20)<=(res.x* 73 + 397)+10
      // })
      // let off2= this.mockData.some(res=>{
      //   //  console.log((383 - 64 *res)-10,pos.y-80,(383 - 64 *res)+10)
      //   return (383 - 64 *res.y)-15<=(pos.y - 90)&&(pos.y - 90)<=(383 - 64 *res.y)
      // })
      // if(off&&off2){
      //   this.pos = pos;
      // }
    },

    modeUpload: function (item) {
      // console.log(item.file);
      this.mode = item.file
      if(this.updateData == 1){
        this.uploadT();
      }else if(this.updateData == 2){
        this.uploadP();
      }else if(this.updateData == 3){
        this.uploadR();
      }else{
        console.log("modeUpload error");
      }
    },

    uploadP: function () {
      console.log("uploadP function");
      let fd = new FormData()
      fd.append('file', this.mode)
      axios.post('http://localhost:8080/impt/position', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log(response.data);
      })
    },
    uploadR: function () {
      console.log("uploadR function");
      let fd = new FormData()
      fd.append('file', this.mode)
      axios.post('http://localhost:8080/impt/running', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }

      }).then(response => {
        console.log(response.data);
      })
    },
    uploadT: function () {
      console.log("uploadT function");
      let fd = new FormData()
      fd.append('file', this.mode)
      axios.post('http://localhost:8080/impt/ground', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }

      }).then(response => {
        console.log(response.data);
      })
    },
//   handleChange(file, fileList) {
//  	this.fileTemp = file.raw
//    	if (this.fileTemp) {
//       	if ((this.fileTemp.type == '.csv') || (this.fileTemp.type == 'application/vnd.ms-excel')) {
//         this.importcsv(file.raw)
//     	} else {
//        	this.$message({
//          	type: 'warning',
//           	message: '附件格式错误，请删除后重新上传！'
//        	 })
//      	}
//    	} else {
//     	this.$message({
//    			type: 'warning',
//             message: '请上传附件！'
//         	})
//   		}
// },
// importcsv (obj) {
//         let _this = this//如果需要点击事件结束之后对DOM进行操作使用)_this.xx=xx进行操作
//         Papa.parse(obj, {
//           complete (results) {
//             console.log(results)//这个是csv文件的数据
//           }
//         })
//       },
    gohome() {
      this.$router.push('/')
    },
    onbos(index) {
      this.idIndex = index;
      console.log("enter getdata");
      this.getData();
      console.log("done getdata");

      // alert(index);
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    }
  }

};
</script>

<style lang="less" scoped>
.active {
  color: #fff;;
}

.hor_time {
  width: 100%;
  height: 100%;
  padding: 20px;
}

.le_header {
  position: relative;
  display: flex;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
  }
}

.onhot {
  width: 50px;
  height: 50px;
  background: cornflowerblue;
  border-radius: 50px;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
}

.button_dao {
  width: 100px;
  height: 40px;
  background: cornflowerblue;
  text-align: center;
  color: cornsilk;
  border-radius: 10px;
  position: relative;
  left: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.body_time {
  width: 100%;
  height: 500px;
  display: flex;
  justify-content: space-between;

  .body_left {
    width: 65%;
    height: 100%;
    font-size: 20px;

    .body_left_tw {
      width: 1000px;
      height: 800px;
      background-image: url('@/assets/img/4.png');
      background-size: 1000px;
      background-repeat: no-repeat;
    }

    .num_time {
      width: 100%;
      display: flex;
      align-items: center;
      position: relative;
      top: 10px;

      div {
        margin-right: 10px;

        span {
          color: #fff;
        }
      }
    }
  }

  //.body_right {
  //  width: 700px;
  //  height: 500px;
  //  background: silver;
  //  //background-image: url("@/assets/img/Figure_1.png");
  //}

  .aa {
    font-size: 25px;
  }

  .body_right_btom {
    width: 700px;
    height: 400px;
    margin-top: 20px;
    background-color: silver;
  }

  .body_right_btom > ul > li {
    list-style-type: none;
    text-align: left;
    padding: 10px;
    box-sizing: border-box;
    background-color: #f3f3f365;
    margin-bottom: 10px;
  }
}
</style>