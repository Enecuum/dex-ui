# Dex

#### Data structure

Acording the React.JS rules the app uses 'state' variable in order to bind properties of interface particles. It was realised side data structure and method to manage 'interface data' for a reason of inconvenience of using nested structures in the 'state'. Take a look at this structure:

![data_structure](doc_img/data_structure.png)

#### Frontend scheme

User interactions scheme. Red border page is the start page.

![front_scheme](doc_img/front_scheme.png)

#### Formulas for auto-complete

Exchange : 
```
    (1 - pool_fee) * liqudity / amount_in, liquidity = volume_1 * volume_2
```
Liquidity : 
```
    input_1 * volume_2 / volume_1 or input_2 * volume_1 / volume_2 
```