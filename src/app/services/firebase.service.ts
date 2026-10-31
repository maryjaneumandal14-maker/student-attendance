import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '../../environments/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private app = initializeApp(firebaseConfig);
  public db = getFirestore(this.app);

  constructor() {}
}