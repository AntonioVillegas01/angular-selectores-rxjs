import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PaisesService} from '../../services/paises.service';
import {Pais, PaisSmall} from '../../interfaces/paises.interface';
import {switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: []
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region: ['', [Validators.required]],
    pais: ['', [Validators.required]],
    frontera: ['', [Validators.required]],
    //   frontera: [{value: '', disabled: true}, [Validators.required]],

  });

  // llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  fronteras: PaisSmall[] = [];

  // UI
  cargando: boolean = false;

  constructor(private fb: FormBuilder,
              private paisesService: PaisesService
  ) {
  }

  ngOnInit(): void {
    // getter de paises service
    this.regiones = this.paisesService.regiones;

    /**
     * Operador switchmap toma el producto de un observable
     * y lo muta al valor de otro observable
     */

    // Cuando cambia a region
    this.miFormulario.get('region')?.valueChanges
      .pipe(
        tap((_) => {
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
          //      this.miFormulario.get('frontera')?.disable();
        }),
        switchMap(region => this.paisesService.getPaisesPorRegion(region))
      )
      .subscribe(paises => {
        this.paises = paises;
        this.cargando = false;
      });


    // Cuando cambia el pais
    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        tap((_) => {
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
          // this.miFormulario.get('frontera')?.enable();
        }),
        switchMap(codigo => this.paisesService.getPaisPorCodigo(codigo)),
        tap((pais) => {
          if (pais?.name && pais.borders.length === 0) {
            this.cargando = false;
          }
        }),
        // tslint:disable-next-line:no-non-null-assertion
        switchMap(pais => this.paisesService.getPaisesPorCodigos(pais?.borders!))
      )
      .subscribe(paises => {
        console.log(paises);
        this.fronteras = paises;
        this.cargando = false;
      });


  }

  guardar() {
    console.log(this.miFormulario.value);
  }
}


