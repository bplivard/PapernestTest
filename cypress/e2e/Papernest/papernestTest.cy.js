
describe('Papernest test', () => {
    it('Enter data to register change of address', () => {
        cy.visit("/onboarding?anonymous&anonymousId=test&id_text=1&destination=newspaper");

        /*####---- FIRST PAGE ----####
        Verify that the url contains the expected expression*/
        cy.url().should('include', '/mon-compte/presse/1');

        //Get the number of available items on the page and click randomly on one of the items 
        cy.get('.radio-container > .mat-tooltip-trigger').then(() => {
            let magazineCount = Cypress.$('.mat-tooltip-trigger').length;
            let randomMagazine = 0 + Math.floor(Math.random() * (magazineCount - 0 + 1));
            cy.get('.radio-container').find('.mat-tooltip-trigger').eq(randomMagazine).invoke('text').then(($value => {
                let magazineName = JSON.stringify($value);
                cy.wrap(magazineName).as('magName');
            }))
            cy.get('.radio-container').find('.mat-tooltip-trigger').eq(randomMagazine).click();
        });
        
        /*####---- SECOND PAGE ----####
        Verify that the url and the page title contain the expected expressions*/
        cy.url().should('include', '/mon-compte/presse/2');
        cy.get('.title').should('have.text', 'Quel est votre numéro d\'abonné ?');

        //Enter a random 8 digits number in the field, verify the color of the 'Next' button and click on it
        let randomClientId = 10000000 + Math.floor(Math.random() * (99999999 - 10000000 + 1));
        cy.get('.input-aragorn').click().type(randomClientId).should('have.value', randomClientId);
        cy.get('#button_next').should('have.css', 'background-color', 'rgb(90, 82, 255)').click();

        /*####---- THIRD PAGE ----####
        Verify that the url and the page title contain the expected expressions*/
        cy.url().should('include', '/mon-compte/presse/3');
        cy.get('.title').should('have.text', 'Quelle est votre nouvelle adresse ?');

        //Enter the street number and the street type to trigger the display of the list with possible matches
        cy.get('.ng-valid').click().type('21 rue');

        //Select a random element from the dropdown list, excluding the last one
        cy.get('.dropdown-suggestions > ul > .ng-star-inserted').then(($list) => {
            let addressCount = Cypress.$($list).length;
            let onlyAddresses = addressCount - 2;
            let randomAddress = 0 + Math.floor(Math.random() * (onlyAddresses - 0 + 1));
            cy.get('.dropdown-suggestions > ul > .ng-star-inserted').eq(randomAddress).click();
        });

        //Get the selected address and give it an alias so the value can be used for validation
        cy.get('input[type="text"]').invoke('val').then(($value) => {
            let inputAddress = JSON.stringify($value);
            cy.wrap(inputAddress).as('address');
        }); 

        //validate an image from Google map is displayed, verify the color of the 'Next' button and click on it
        cy.get('.map-container').should('be.visible');
        cy.get('#button_next').should('have.css', 'background-color', 'rgb(90, 82, 255)').click();

        /*####---- FOURTH PAGE ----####
        Verify that the url and the page title contain the expected expressions*/
        cy.url().should('include', '/mon-compte/presse/4');
        cy.get('.title').should('have.text', 'Vos informations personnelles');

        //Enter a value in the 'Email' field and verify that it has been verified as valid
        cy.get('input[type="email"]').click().type(`${randomClientId}${'test@papernest.com'}`);
        cy.get('mat-icon.mat-icon:nth-child(3)').should('exist');

        //Enter a value in the 'Phone' field and verify that it has been verified as valid
        cy.get('input[type="tel"]').click().type(`${'06'}${randomClientId}`);
        cy.get('mat-icon.input-aragorn__error-icon:nth-child(2)').should('exist');

        /*Enter a value in the 'Name' and 'Surname' fields and verify that the content
         of both fields has been verified as valid*/
        const name = ['Jane', 'Doe'];
        cy.get('input[type="text"]').each(($el, index) => {
            cy.wrap($el).click().type(name[index]);
            cy.get('mat-icon:nth-child(3)').should('exist');

        });

        //Verify the color of the 'Next' button and click on it
        cy.get('#button_next').should('have.css', 'background-color', 'rgb(90, 82, 255)').click();

        /*####---- FIFTH PAGE ----####
        Verify that the url and the page title contain the expected expressions*/
        cy.url().should('include', '/mon-compte/presse/5');
        cy.get('@address').then(address => {
            let stripedAddress = address.slice(1, -1);
            cy.get('.title').should('have.text', 
        `${'À partir de quand voulez-vous recevoir les journaux au '}${stripedAddress}${' ?'}`);
        });

        //Click in the 'begin date' field to display the calendar
        cy.get('input').click();

        //Get today as the begin date and select the day from the calendar
        let now = new Date();
        let day = now.getDate();
        let dateFrom = day - 1;
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let longDate = now.toLocaleDateString('fr-FR', options);
        let finalLongDate = longDate.replace(/^[a-z]/i, str => str.toUpperCase());

        cy.get('.mat-calendar-body').find('button').eq(dateFrom).click();

        /*####---- SIXTH PAGE ----####
        Verify that the url and the page title contain the expected expressions*/
        cy.url().should('include', '/mon-compte/presse/6');
        cy.get('.title').should('have.text', `${'Est-ce que tout est bon '}${name[0]}${' ?'}`);

        //Validate the content of each line of the summary table and click on the 'Validate' button
        cy.get('ppn-summary').find('.summary__line__value').each(($line, index) => {
            switch (index) {
                case 0:
                    cy.get('@magName').then(magName => {
                        if(magName == 'Fermer') {
                            magName = 'Closer';
                            cy.get($line).should('have.text', magName.slice(1, -1));
                        }else if(magName == 'Telerama') {
                            magName = 'Télérama'
                            cy.get($line).should('have.text', magName.slice(1, -1));
                        } else {
                            cy.get($line).should('have.text', magName.slice(1, -1));
                        }
                    });
                    break;
                case 1:
                    expect($line).to.have.text(randomClientId);
                    break;
                case 2:
                    cy.get('@address').then(selectedAddress => {
                        cy.get($line).should('have.text', selectedAddress.slice(1, -1));
                    });
                    break;
                case 3:
                    expect($line).to.have.text(`${randomClientId}${'test@papernest.com'}`);
                    break;
                case 4:
                    expect($line).to.have.text(name[0]);
                    break;
                case 5:
                    expect($line).to.have.text(name[1]);
                    break;
                case 6:
                    expect($line).to.have.text(finalLongDate);
                    break;
                default:
                    break;
            }

        });
        cy.get('#button_validate_newspaper').click();

        //Verify that the dialog is displayed with the expected name in the title
        cy.get('dialog').find('h1').should('have.text', `${'Merci '}${name[0]}${' !'}`);

        //click on the 'Terminer' button
        cy.get('#_validaton_ar').click();

    });
})