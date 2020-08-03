import { Pipe, PipeTransform } from '@angular/core';

interface FilterProperties {
  filter: string;
  field: string;
}

// This filter is case insensitive

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(list: any[], filterProperties: FilterProperties): any {

    if ( filterProperties.filter ) {
      return list.filter(item => {
        return item[filterProperties.field].toUpperCase().indexOf(filterProperties.filter.toUpperCase()) !== -1;
      });
    } else {
      return list;
    }

  }

}
