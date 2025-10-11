import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

interface Section {
  id: number;
  name: string;
  description: string;
  posts_count?: number;
}

@Component({
  selector: 'app-section-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './section-management.component.html',
  styleUrl: './section-management.component.css'
})
export class SectionManagementComponent implements OnInit {
  sections: Section[] = [];
  loading = false;
  error = '';
  showAddForm = false;
  newSection: Section = { id: 0, name: '', description: '' };
  editingSection: Section | null = null;
  
  constructor(private adminService: AdminService) {}
  
  ngOnInit(): void {
    this.loadSections();
  }
  
  loadSections(): void {
    this.loading = true;
    
    this.adminService.getAllSections()
      .subscribe({
        next: (response) => {
          this.sections = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.msg || '加载板块列表失败';
          this.loading = false;
        }
      });
  }
  
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newSection = { id: 0, name: '', description: '' };
    }
  }
  
  addSection(): void {
    if (!this.newSection.name.trim()) {
      this.error = '板块名称不能为空';
      return;
    }
    
    this.adminService.createSection({
      name: this.newSection.name,
      description: this.newSection.description
    })
      .subscribe({
        next: (response) => {
          this.sections.push(response.data);
          this.showAddForm = false;
          this.newSection = { id: 0, name: '', description: '' };
        },
        error: (err) => {
          this.error = err.error?.msg || '创建板块失败';
        }
      });
  }
  
  editSection(section: Section): void {
    this.editingSection = { ...section };
  }
  
  cancelEdit(): void {
    this.editingSection = null;
  }
  
  updateSection(): void {
    if (!this.editingSection) return;
    if (!this.editingSection.name.trim()) {
      this.error = '板块名称不能为空';
      return;
    }
    
    this.adminService.updateSection(
      this.editingSection.id,
      {
        name: this.editingSection.name,
        description: this.editingSection.description
      }
    ).subscribe({
      next: (response) => {
        const index = this.sections.findIndex(s => s.id === this.editingSection!.id);
        if (index !== -1) {
          this.sections[index] = response.data;
        }
        this.editingSection = null;
      },
      error: (err) => {
        this.error = err.error?.msg || '更新板块失败';
      }
    });
  }
  
  deleteSection(sectionId: number): void {
    if (!confirm('确定要删除此板块吗？此操作将删除板块下的所有帖子，且不可撤销。')) return;
    
    this.adminService.deleteSection(sectionId)
      .subscribe({
        next: () => {
          this.sections = this.sections.filter(section => section.id !== sectionId);
        },
        error: (err) => {
          this.error = err.error?.msg || '删除板块失败';
        }
      });
  }
}
