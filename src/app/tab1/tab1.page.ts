
import { Component } from '@angular/core';
import {
  addDoc,
  collection
} from 'firebase/firestore';

import { FirebaseService } from '../services/firebase.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  studentName = '';
  studentId = '';
  course = '';
  status = 'Present';

  isSaving = false;

  constructor(
    private firebaseService: FirebaseService,
    private navCtrl: NavController
  ) {}

  async addStudent() {

    if (this.isSaving) {
      return;
    }

    if (
      !this.studentName ||
      !this.studentId ||
      !this.course
    ) {
      alert('Please complete all fields.');
      return;
    }

    this.isSaving = true;

    // SAVE THE DATA FIRST
    const newStudent = {
      name: this.studentName,
      studentId: this.studentId,
      course: this.course,
      status: this.status
    };

    // CLEAR THE FORM IMMEDIATELY
    // so the previous student's information disappears
    this.clearForm();

    try {

      const studentsRef = collection(
        this.firebaseService.db,
        'students'
      );

      await addDoc(
        studentsRef,
        newStudent
      );

      // Saving is finished
      this.isSaving = false;

      alert('Student added successfully!');

      // Go to Tab 2 after OK
      this.navCtrl.navigateRoot('/tabs/tab2');

    } catch (error) {

      console.error(
        'Error adding student:',
        error
      );

      this.isSaving = false;

      alert(
        'Failed to add student. Please check your Firebase connection.'
      );
    }
  }

  clearForm() {

    this.studentName = '';
    this.studentId = '';
    this.course = '';
    this.status = 'Present';

  }

}