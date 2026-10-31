import { Component, ChangeDetectorRef } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from 'firebase/firestore';

import { FirebaseService } from '../services/firebase.service';

interface Student {
  id?: string;
  name: string;
  studentId: string;
  course: string;
  status: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  students: Student[] = [];

  // SEARCH
  searchText = '';

  // STATUS FILTER
  selectedStatus = 'All';

  // EDIT STUDENT
  editingId: string | null = null;

  studentName = '';
  studentId = '';
  course = '';
  status = 'Present';

  // LOADING
  loading = false;

  // TOAST
  toastOpen = false;
  toastMessage = '';

  constructor(
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {}

  // ==========================================
  // LOAD STUDENTS
  // ==========================================

  ionViewWillEnter() {
    this.loadStudents();
  }

  async loadStudents() {

    try {

      const studentsRef = collection(
        this.firebaseService.db,
        'students'
      );

      const snapshot = await getDocs(studentsRef);

      const loadedStudents = snapshot.docs.map(studentDoc => ({
        id: studentDoc.id,
        ...studentDoc.data()
      })) as Student[];

      console.log(
        'NUMBER OF STUDENTS:',
        loadedStudents.length
      );

      console.log(
        'STUDENT DATA:',
        loadedStudents
      );

      this.students = loadedStudents;

      this.cdr.detectChanges();

    } catch (error) {

      console.error(
        'Error loading students:',
        error
      );

      this.showToast(
        'Cannot load students from Firebase.'
      );
    }
  }


  // ==========================================
  // SEARCH
  // ==========================================

  get filteredStudents(): Student[] {

    const search = this.searchText
      .toLowerCase()
      .trim();

    if (!search) {
      return this.students;
    }

    return this.students.filter(student =>

      student.name
        .toLowerCase()
        .includes(search) ||

      student.studentId
        .toLowerCase()
        .includes(search) ||

      student.course
        .toLowerCase()
        .includes(search) ||

      student.status
        .toLowerCase()
        .includes(search)

    );
  }


  // ==========================================
  // STATUS FILTER
  // ==========================================

  get displayedStudents(): Student[] {

    if (this.selectedStatus === 'All') {
      return this.filteredStudents;
    }

    return this.filteredStudents.filter(
      student =>
        student.status.toLowerCase() ===
        this.selectedStatus.toLowerCase()
    );
  }


  // ==========================================
  // EDIT STUDENT
  // ==========================================

  editStudent(student: Student) {

    this.editingId = student.id ?? null;

    this.studentName = student.name;
    this.studentId = student.studentId;
    this.course = student.course;
    this.status = student.status;

    this.cdr.detectChanges();
  }


  // ==========================================
  // UPDATE STUDENT
  // ==========================================

  async updateStudent() {

    if (!this.editingId) {
      return;
    }

    // CHECK EMPTY FIELDS
    if (
      !this.studentName.trim() ||
      !this.studentId.trim() ||
      !this.course.trim()
    ) {

      this.showToast(
        'Please complete all fields.'
      );

      return;
    }

    this.loading = true;

    try {

      const studentRef = doc(
        this.firebaseService.db,
        'students',
        this.editingId
      );

      await updateDoc(
        studentRef,
        {
          name: this.studentName.trim(),
          studentId: this.studentId.trim(),
          course: this.course.trim(),
          status: this.status
        }
      );

      // CLOSE LOADING BEFORE RELOADING
      this.loading = false;

      // RELOAD STUDENTS
      await this.loadStudents();

      // CLEAR FORM
      this.clearForm();

      // SHOW MESSAGE
      this.showToast(
        'Student updated successfully!'
      );

    } catch (error) {

      console.error(
        'Error updating student:',
        error
      );

      this.loading = false;

      this.showToast(
        'Failed to update student.'
      );
    }
  }


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  cancelEdit() {
    this.clearForm();
  }


  // ==========================================
  // CLEAR FORM
  // ==========================================

  clearForm() {

    this.studentName = '';
    this.studentId = '';
    this.course = '';
    this.status = 'Present';

    this.editingId = null;

    this.cdr.detectChanges();
  }


  // ==========================================
  // DELETE STUDENT
  // ==========================================

  async deleteStudent(id: string | undefined) {

    if (!id) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this student?'
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;

    try {

      const studentRef = doc(
        this.firebaseService.db,
        'students',
        id
      );

      await deleteDoc(studentRef);

      // CLOSE LOADING FIRST
      this.loading = false;

      // RELOAD LIST
      await this.loadStudents();

      this.showToast(
        'Student deleted successfully!'
      );

    } catch (error) {

      console.error(
        'Error deleting student:',
        error
      );

      this.loading = false;

      this.showToast(
        'Failed to delete student.'
      );
    }
  }


  // ==========================================
  // PULL TO REFRESH
  // ==========================================

  async refreshStudents(event: any) {

    try {

      await this.loadStudents();

    } finally {

      event.target.complete();

    }
  }


  // ==========================================
  // REORDER STUDENTS
  // ==========================================

  doReorder(event: any) {

    const from = event.detail.from;
    const to = event.detail.to;

    // Only reorder when showing all students
    if (
      this.searchText.trim() !== '' ||
      this.selectedStatus !== 'All'
    ) {

      event.detail.complete();
      return;
    }

    const movedStudent = this.students.splice(
      from,
      1
    )[0];

    this.students.splice(
      to,
      0,
      movedStudent
    );

    event.detail.complete();

    this.cdr.detectChanges();
  }


  // ==========================================
  // TOAST
  // ==========================================

  showToast(message: string) {

    this.toastMessage = message;
    this.toastOpen = true;

  }

}