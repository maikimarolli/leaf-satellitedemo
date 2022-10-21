import { Component, OnInit, OnDestroy, Input, ElementRef } from '@angular/core';
import { NgxSidebarControlComponent } from '@runette/ngx-leaflet-sidebar';
import * as L from 'leaflet';
import { GeoJsonTypes } from 'geojson';
import { AppService } from '../app.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AstMemoryEfficientTransformer } from '@angular/compiler';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy {
  public map: any;
  public isLoading: boolean = false;
  public isLogged: boolean = false;
  public loginMessage: string = '';
  public createFieldMessage: string = '';
  public loadImagesMessage: string = '';

  public fields: any;
  public images: any;

  public imagens: any;
  public bounds: any;

  loginForm!: FormGroup;
  searchImagesForm!: FormGroup;
  createFieldForm!: FormGroup;

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3,
    });

    const osm = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    var token =
      'pk.eyJ1IjoibWFpa2ltYXJvbGxpIiwiYSI6ImNsNTJvYmdlczBoZnYzaW02N2Z0azhlNHcifQ.zo0sI9NJNCq3k4W4YDXXPg';

    const mapBox = L.tileLayer(
      'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=' +
        token,
      {
        maxZoom: 21,
        tileSize: 512,
        zoomOffset: -1,
        attribution:
          '© <a href="https://www.mapbox.com/contribute/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    osm.addTo(this.map);
    mapBox.addTo(this.map);

    const baseMaps = {
      OpenStreetMap: osm,
      MapBox: mapBox,
    };

    this.imagens = L.layerGroup().addTo(this.map);
    this.bounds = L.layerGroup().addTo(this.map);

    const layerControl = L.control.layers(baseMaps).addTo(this.map);

    var options: L.SidebarOptions = {
      container: 'sidebar',
      position: 'left',
    };

    var sidebar = L.control.sidebar(options);

    this.map.addControl(sidebar);
  }

  constructor(private appService: AppService, private el: ElementRef) {}

  ngOnInit(): void {
    this.initMap();
    localStorage.removeItem('token');
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
    this.searchImagesForm = new FormGroup({
      fieldId: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });
    this.createFieldForm = new FormGroup({
      fieldId: new FormControl('', [Validators.required]),
      daysBefore: new FormControl('', [Validators.required]),
      bounderyType: new FormControl('', [Validators.required]),
      fieldBoundery: new FormControl('', [Validators.required]),
      provider: new FormControl('', [Validators.required]),
    });
  }

  ngOnDestroy(): void {}

  getCreateFieldId() {
    return this.createFieldForm.get('fieldId')!;
  }

  getCreateDaysBefore() {
    return this.createFieldForm.get('daysBefore')!;
  }

  getCreateBounderyType() {
    return this.createFieldForm.get('bounderyType')!;
  }

  getCreateFieldBoundery() {
    return this.createFieldForm.get('fieldBoundery')!;
  }

  getCreateProvider() {
    return this.createFieldForm.get('provider')!;
  }

  getEmail() {
    return this.loginForm.get('email')!;
  }

  getPassword() {
    return this.loginForm.get('password')!;
  }

  getFieldId() {
    return this.searchImagesForm.get('fieldId');
  }

  getStartDate() {
    return this.searchImagesForm.get('startDate');
  }

  getEndDate() {
    return this.searchImagesForm.get('endDate');
  }

  setFieldId(id: string) {
    this.searchImagesForm.controls['fieldId'].setValue(id);
  }

  setStartDate(date: string) {
    this.searchImagesForm.controls['startDate'].setValue(date);
  }

  setEndDate(date: string) {
    this.searchImagesForm.controls['endDate'].setValue(date);
  }

  doLogin() {
    this.isLoading = true
    this.loginMessage = '';
    let email = this.getEmail().value;
    let password = this.getPassword().value;
    if (email === '' || password === '') {
      this.isLoading = false;
      if (email === '') {
        this.loginMessage = 'You need to insert your email first.';
      } else {
        this.loginMessage = 'You need to insert your password first.';
      }
    } else {
      this.appService.login(email, password).subscribe((data) => {
        this.isLoading = false;
        this.loginMessage = data.message;
        if (data.message === 'Congrats! Login done!') {
          this.isLogged = true;
          localStorage.setItem('token', data.token);
          console.log(localStorage.getItem('token'));
          document.getElementById('fields_a')!.click();
          this.loadCreatedFields();
        } else {
          this.isLogged = false;
        }
      });
    }
  }

  loadCreatedFields() {
    this.isLoading = true;
    this.appService.loadFields(localStorage.getItem('token')!).subscribe((data) => {
      this.isLoading = false;
      this.fields = data;
    });
  }

  firstLoadImages(fieldId: string) {
    document.getElementById('field_images_a')!.click();
    this.isLoading = true;
    let endDate = new Date();
    let startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    let realEndDate;
    let realStartDate;
    realEndDate = endDate.toISOString();
    realStartDate = startDate.toISOString();
    realEndDate = realEndDate.substring(0, 10);
    realStartDate = realStartDate.substring(0, 10);
    this.setFieldId(fieldId);
    this.setStartDate(realStartDate);
    this.setEndDate(realEndDate);
    this.appService
      .loadImages(fieldId, realStartDate, realEndDate, localStorage.getItem('token')!)
      .subscribe((data) => {
        this.isLoading = false;
        this.loadImagesMessage = '';
        if (data === 'No images were found for the time and field selected') {
          this.loadImagesMessage = data;
        } else {
          this.images = [];
          this.images = data.images;

          var geometry = data.geometry[0][0];

          var json = {
            type: 'Feature' as GeoJsonTypes,
            geometry: {
              type: 'Polygon',
              coordinates: [geometry],
            },
          };

          var polygonStyle = {
            weight: 2,
            opacity: 1,
            fill: false,
            'fill-opacity': 0,
          } as L.GeoJSONOptions;

          this.bounds.clearLayers();
          this.imagens.clearLayers();

          var geoJsonLayer = L.geoJson(json, polygonStyle).addTo(this.bounds);
          var geoBounds = geoJsonLayer.getBounds();
          this.map.flyTo(geoJsonLayer.getBounds().getCenter(), 15);

          this.images.forEach((e: any) => {
            e.images.forEach((f: any) => {
              f.bounds = geoBounds;
              f.date = e.date.substring(11, 23);
              if (e.provider === 'sentinel') {
                f.imgtype = f.url.split('/0/')[1].split('.')[0].split('_')[0];
              } else if (e.provider === 'planet') {
                f.imgtype = f.url
                  .split('_SR.tif/')[1]
                  .split('.')[0]
                  .split('_')[0];
              } else {
                f.imgtype = 'not supported';
              }
            });
            e.date = e.date.substring(0, 10);
          });
        }
      });
  }

  showImage(url: string) {
    this.imagens.clearLayers();

    this.images.forEach((e: any) => {
      e.images.forEach((f: any) => {
        if (f.url === url) {
          L.imageOverlay(f.url, f.bounds).addTo(this.imagens);
        }
      });
    });
  }

  loadFieldImages() {
    this.isLoading = true;
    let fieldId = this.getFieldId()!.value;
    let startDate = this.getStartDate()!.value;
    let endDate = this.getEndDate()!.value;
    if (fieldId === '' || startDate === '' || endDate === '') {
      this.loadImagesMessage = 'You need to fill all the inputs.';
      this.isLoading = false;
    } else {
      this.appService
        .loadImages(fieldId, startDate, endDate, localStorage.getItem('token')!)
        .subscribe((data) => {
          this.isLoading = false;
          this.loadImagesMessage = '';
          if (
            data === 'No images were found for the time and field selected' ||
            data === 'Request failed with status code 404'
          ) {
            this.loadImagesMessage = data;
          } else {
            this.images = [];
            this.images = data.images;

            var geometry = data.geometry[0][0];

            var json = {
              type: 'Feature' as GeoJsonTypes,
              geometry: {
                type: 'Polygon',
                coordinates: [geometry],
              },
            };

            var polygonStyle = {
              weight: 2,
              opacity: 1,
              fill: false,
              'fill-opacity': 0,
            } as L.GeoJSONOptions;

            this.bounds.clearLayers();
            this.imagens.clearLayers();

            var geoJsonLayer = L.geoJson(json, polygonStyle).addTo(this.bounds);
            var geoBounds = geoJsonLayer.getBounds();
            this.map.flyTo(geoJsonLayer.getBounds().getCenter(), 15);

            this.images.forEach((e: any) => {
              e.images.forEach((f: any) => {
                f.bounds = geoBounds;
                f.date = e.date.substring(11, 23);
                if (e.provider === 'sentinel') {
                  f.imgtype = f.url.split('/0/')[1].split('.')[0].split('_')[0];
                } else if (e.provider === 'planet') {
                  f.imgtype = f.url
                    .split('_SR.tif/')[1]
                    .split('.')[0]
                    .split('_')[0];
                } else {
                  f.imgtype = 'not supported';
                }
              });
              e.date = e.date.substring(0, 10);
            });
          }
        });
    }
  }

  goFields() {
    document.getElementById('create_field_a')!.click();
  }

  createField() {
    this.isLoading = true;
    let fieldId = this.getCreateFieldId().value;
    let daysBefore = this.getCreateDaysBefore().value;
    let bounderyType = this.getCreateBounderyType().value;
    let fieldBoundery = this.getCreateFieldBoundery().value;
    let provider = this.getCreateProvider().value;

    if (
      fieldId === '' ||
      daysBefore === '' ||
      bounderyType === '' ||
      fieldBoundery === '' ||
      provider === ''
    ) {
      this.isLoading = false;
      this.createFieldMessage = 'You need to fill all the fields first.';
    } else {
      this.appService
        .createField(fieldId, daysBefore, bounderyType, fieldBoundery, provider, localStorage.getItem('token')!)
        .subscribe((data) => {
          this.isLoading = false;
          this.createFieldMessage = data;
        });
    }
  }
}
