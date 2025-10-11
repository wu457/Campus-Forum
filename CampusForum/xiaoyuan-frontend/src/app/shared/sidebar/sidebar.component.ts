import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SectionService } from '../../section/section.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
goHome() {
this.router.navigate(['/home']);
}
  sections: any[] = [];
  selectedSectionId: number | null = null;
  constructor(private sectionService: SectionService, private router: Router) {}
  ngOnInit() {
    this.getSections();
  }
  getSections() {
    this.sectionService.getSections().subscribe(res => this.sections = res.data);
  }
  selectSection(section: any) {
    this.selectedSectionId = section.id;
    this.router.navigate(['/section', section.id]);
  }
}
