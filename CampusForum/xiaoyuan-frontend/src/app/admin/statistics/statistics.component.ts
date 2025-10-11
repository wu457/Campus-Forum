import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStatistics } from '../admin.service';
import Chart from 'chart.js/auto';

// Chart.js/auto 自动注册所有组件

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  // 统计数据
  statistics: AdminStatistics | null = null;
  loading = true;
  error = '';
  
  // 图表引用
  @ViewChild('userStatsCanvas') userStatsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('postStatsCanvas') postStatsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sectionStatsCanvas') sectionStatsCanvas!: ElementRef<HTMLCanvasElement>;
  
  // 图表实例
  userStatsChart: Chart | null = null;
  postStatsChart: Chart | null = null;
  sectionStatsChart: Chart | null = null;
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.loadStatistics();
  }
  
  ngAfterViewInit(): void {
    console.log('视图初始化完成');
    // 视图初始化后，如果已有数据则初始化图表
    if (this.statistics) {
      console.log('视图初始化后发现已有统计数据，延迟初始化图表');
      // 使用更长的延迟和重试机制确保容器有正确尺寸
      setTimeout(() => {
        this.initChartsWithRetry();
      }, 100);
    }
  }
  
  loadStatistics(): void {
    this.loading = true;
    this.error = '';
    
    console.log('开始加载统计数据...');
    this.adminService.getAdminStatistics().subscribe({
      next: (response) => {
        console.log('统计数据加载成功:', response.data);
        this.statistics = response.data;
        this.loading = false;
        
        // 如果视图已初始化，则创建图表
        if (this.userStatsCanvas && this.postStatsCanvas && this.sectionStatsCanvas) {
          // 使用延迟和重试机制确保容器有正确尺寸
          setTimeout(() => {
            this.initChartsWithRetry();
          }, 300); // 增加延迟时间，确保DOM完全渲染
        }
      },
      error: (err) => {
        console.error('获取统计数据失败', err);
        this.error = '获取统计数据失败，请稍后再试';
        this.loading = false;
      }
    });
  }
  
  initChartsWithRetry(): void {
    if (this.checkContainerSizes()) {
      console.log('开始初始化图表');
      this.initCharts();
    } else {
      console.log('Canvas元素未准备好，稍后重试');
      setTimeout(() => {
        this.initChartsWithRetry();
      }, 100);
    }
  }

  checkContainerSizes(): boolean {
    try {
      if (!this.userStatsCanvas || !this.postStatsCanvas || !this.sectionStatsCanvas) {
        console.log('Canvas元素未准备好');
        return false;
      }
      
      // 简化检查，只要Canvas元素存在就认为可以初始化
      // Chart.js的响应式布局会自动处理容器尺寸
      console.log('Canvas元素已准备好，可以初始化图表');
      return true;
    } catch (error) {
      console.error('检查容器尺寸时出错:', error);
      return false;
    }
  }

  initCharts(): void {
    try {
      if (!this.statistics || !this.userStatsCanvas || !this.postStatsCanvas || !this.sectionStatsCanvas) {
        console.log('统计数据或Canvas元素未准备好');
        return;
      }
      
      console.log('开始初始化所有图表');
      this.initUserStatsChart();
      this.initPostStatsChart();
      this.initSectionStatsChart();
      console.log('所有图表初始化完成');
    } catch (error) {
      console.error('初始化图表时出错:', error);
    }
  }


  
  initUserStatsChart(): void {
    try {
      if (this.userStatsChart) {
        this.userStatsChart.destroy();
        this.userStatsChart = null;
      }
      
      if (!this.userStatsCanvas || !this.statistics) {
        return;
      }
      
      const ctx = this.userStatsCanvas.nativeElement.getContext('2d');
      if (!ctx) return;
      
      const chartData = [
        this.statistics.user_statistics.total_users,
        this.statistics.user_statistics.new_users_today,
        this.statistics.user_statistics.online_users
      ];
      
      this.userStatsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['总用户数', '今日新增', '在线用户'],
          datasets: [{
            data: chartData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    } catch (error) {
      console.error('初始化用户统计图表时出错:', error);
    }
  }
  
  initPostStatsChart(): void {
    try {
      if (this.postStatsChart) {
        console.log('销毁旧的帖子统计图表');
        this.postStatsChart.destroy();
        this.postStatsChart = null;
      }
      
      if (!this.postStatsCanvas) {
        console.error('帖子统计图表Canvas元素不存在');
        return;
      }
      
      const ctx = this.postStatsCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('无法获取Canvas上下文');
        return;
      }
      
      if (!this.statistics) {
        console.error('统计数据为空');
        return;
      }
      
      const chartData = [
        this.statistics.post_statistics.total_posts,
        this.statistics.post_statistics.new_posts_today,
        this.statistics.comment_statistics.total_comments,
        this.statistics.comment_statistics.new_comments_today
      ];
      
      console.log('创建帖子统计图表', {
        canvas: this.postStatsCanvas.nativeElement,
        context: ctx,
        data: chartData
      });
      
      this.postStatsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['总帖子数', '今日新增帖子', '总评论数', '今日新增评论'],
          datasets: [{
            label: '数量',
            data: chartData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: '帖子与评论统计'
            }
          }
        }
      });
      
      console.log('帖子统计图表创建成功:', this.postStatsChart);
    } catch (error) {
      console.error('初始化帖子统计图表时出错:', error);
    }
  }
  
  initSectionStatsChart(): void {
    try {
      if (this.sectionStatsChart) {
        console.log('销毁旧的板块统计图表');
        this.sectionStatsChart.destroy();
        this.sectionStatsChart = null;
      }
      
      if (!this.sectionStatsCanvas) {
        console.error('板块统计图表Canvas元素不存在');
        return;
      }
      
      const ctx = this.sectionStatsCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('无法获取Canvas上下文');
        return;
      }
      
      if (!this.statistics || !this.statistics.section_statistics) {
        console.error('统计数据或板块统计数据为空');
        return;
      }
      
      // 准备数据
      const labels = this.statistics.section_statistics.map(section => section.name);
      const data = this.statistics.section_statistics.map(section => section.post_count);
      
      console.log('创建板块统计图表', {
        canvas: this.sectionStatsCanvas.nativeElement,
        context: ctx,
        labels: labels,
        data: data
      });
      
      // 生成随机颜色
      const backgroundColors = this.generateColors(labels.length, 0.7);
      const borderColors = this.generateColors(labels.length, 1);
      
      this.sectionStatsChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: '帖子数量',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: '各板块帖子数量分布'
            }
          }
        }
      });
      
      console.log('板块统计图表创建成功:', this.sectionStatsChart);
    } catch (error) {
      console.error('初始化板块统计图表时出错:', error);
    }
  }
  
  // 生成随机颜色
  generateColors(count: number, alpha: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colors.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }
    return colors;
  }
  
  // 刷新数据
  refreshData(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    // 销毁图表实例以释放内存
    this.destroyAllCharts();
  }
  
  @HostListener('window:resize')
  onResize(): void {
    console.log('窗口大小变化，重新初始化图表');
    // 在窗口大小变化时重新初始化图表
    if (this.statistics) {
      // 销毁现有图表
      this.destroyAllCharts();
      
      // 使用重试机制重新初始化图表
      setTimeout(() => {
        this.initChartsWithRetry();
      }, 100);
    }
  }

  destroyAllCharts(): void {
    if (this.userStatsChart) {
      this.userStatsChart.destroy();
      this.userStatsChart = null;
    }
    if (this.postStatsChart) {
      this.postStatsChart.destroy();
      this.postStatsChart = null;
    }
    if (this.sectionStatsChart) {
      this.sectionStatsChart.destroy();
      this.sectionStatsChart = null;
    }
  }
}
