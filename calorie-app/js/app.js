// TODO: put each class into separate file
class CalorieTracker {
    #calorieLimit = Storage.getCalorieLimit();
    #totalCalories = Storage.getTotalCalories(0);
    #meals = Storage.getItems('meals');
    #workouts = Storage.getItems('workouts');

    constructor() {
        this.#displayCaloriesTotal();
        this.#displayCaloriesLimit();
        this.#displayCaloriesConsumed();
        this.#displayCaloriesBurned();
        this.#displayCaloriesRemaining()

        document.querySelector('#limit').value = this.#calorieLimit;
    }

    addMeal(meal) {
        this.#meals.push(meal);
        this.#totalCalories += meal.calories;
        Storage.updateTotalCalories(this.#totalCalories);
        Storage.saveMeal(meal);
        this.#displayNewItem(meal, 'meal');
        this.#render()
    }

    addWorkout(workout) {
        this.#workouts.push(workout);
        this.#totalCalories -= workout.calories;
        Storage.updateTotalCalories(this.#totalCalories);
        Storage.saveWorkout(workout);
        this.#displayNewItem(workout, 'workout');
        this.#render()
    }

    removeItem(id, type) {
        const items = type ==='meal' ? this.#meals : this.#workouts;
        const index = items.findIndex((item) => item.id === id);

        if (index !== -1) {
            this.#totalCalories += items[index].calories;
            Storage.updateTotalCalories(this.#totalCalories);
            items.splice(index, 1);
            Storage.remove(id, `${type}s`)
            this.#render();
        }
    }

    reset() {
        this.#totalCalories = 0;
        this.#meals = [];
        this.#workouts = [];
        Storage.clearAll()
        this.#render()
    }

    setLimit(calorieLimit) {
        this.#calorieLimit = calorieLimit;
        Storage.setCalorieLimit(calorieLimit);
        this.#displayCaloriesLimit();
        this.#render();
    }

    loadItems() {
        this.#meals.forEach(meal => this.#displayNewItem(meal, 'meal'));
        this.#workouts.forEach(workout => this.#displayNewItem(workout, 'workout'));
    }

    #displayCaloriesTotal() {
        const totalCaloriesEl = document.querySelector('#calories-total');
        totalCaloriesEl.innerHTML = this.#totalCalories;
    }

    #displayCaloriesLimit() {
        const calorieLimitEl = document.querySelector('#calories-limit');
        calorieLimitEl.innerHTML = this.#calorieLimit;
    }

    #displayCaloriesConsumed() {
        const caloriesConsumedEl = document.querySelector('#calories-consumed');
        const consumed = this.#meals.reduce((accumulator, meal) => accumulator + meal.calories, 0);
        caloriesConsumedEl.innerHTML = consumed;
    }

    #displayCaloriesBurned() {
        const caloriesBurnedEl = document.querySelector('#calories-burned');
        const burned = this.#workouts.reduce((accumulator, meal) => accumulator + meal.calories, 0);
        caloriesBurnedEl.innerHTML = burned
    }

    #displayCaloriesRemaining() {
        const caloriesRemainingEl = document.querySelector('#calories-remaining');
        const progressEl = document.querySelector('#calorie-progress');

        const remaining = this.#calorieLimit - this.#totalCalories;
        caloriesRemainingEl.innerHTML = remaining;

        const parent = caloriesRemainingEl.closest('.card');
        if (remaining <= 0) {
            parent.classList.remove('bg-light');
            parent.classList.add('bg-danger', 'text-white');
            progressEl.classList.remove('bg-success');
            progressEl.classList.add('bg-danger');
        } else {
            parent.classList.remove('bg-danger', 'text-white');
            parent.classList.add('bg-light');
            progressEl.classList.remove('bg-danger');
            progressEl.classList.add('bg-success');
        }
    }

    #displayCaloriesProgress() {
        const progressEl = document.querySelector('#calorie-progress');
        const percentage = (this.#totalCalories / this.#calorieLimit) * 100;
        const width = Math.min(percentage, 100);
        progressEl.style.width = `${width}%`;
    }

    #displayNewItem(item, type) {
        const itemsContainer = document.querySelector(`#${type}-items`);
        const itemEl = document.createElement('div');
        itemEl.classList.add('card', 'my-2');
        itemEl.setAttribute('data-id', item.id);
        itemEl.innerHTML = `
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
            <h4 class="mx-1">${item.name}</h4>
            <div
                class="fs-1 bg-${type === 'meal' ? 'primary' : 'secondary'} text-white text-center rounded-2 px-2 px-sm-5">
                ${item.calories}
            </div>
            <button class="delete btn btn-danger btn-sm mx-2">
                <i class="fa-solid fa-xmark"></i>
            </button>
            </div>
        </div>
        `;

        itemsContainer.appendChild(itemEl);
    }

    #render() {
        this.#displayCaloriesTotal();
        this.#displayCaloriesConsumed();
        this.#displayCaloriesBurned();
        this.#displayCaloriesRemaining()
        this.#displayCaloriesProgress();
    }
}

class Meal {
    constructor(name, calories) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calories = calories;
    }
}

class Workout {
    constructor(name, calories) {
        this.id = Math.random().toString(16).slice(2);
        this.name = name;
        this.calories = calories;
    }
}

class Storage {
    static getCalorieLimit(defaultLimit = 2000) {
        return localStorage.getItem('calorieLimit') === null
        ? defaultLimit
        : +localStorage.getItem('calorieLimit');
    }

    static setCalorieLimit(calorieLimit) {
        localStorage.setItem('calorieLimit', calorieLimit);
    }

    static getTotalCalories(defaultCalories = 0) {
        return localStorage.getItem('totalCalories') === null
        ? defaultCalories
        : +localStorage.getItem('totalCalories');
    }

    static updateTotalCalories(calories) {
        localStorage.setItem('totalCalories', calories);
    }

    static getItems(type) {
        return localStorage.getItem(type) === null
        ? []
        : JSON.parse(localStorage.getItem(type));
    }

    static remove(id, type) {
        const items = Storage.getItems(type);
        items.forEach((item, index) => {
            if (item.id === id) {
                items.splice(index, 1);
            }
        })

        localStorage.setItem(type, JSON.stringify(items))
    }

    static saveMeal(meal) {
        const meals = Storage.getItems('meals');
        meals.push(meal);
        localStorage.setItem('meals', JSON.stringify(meals));
    }

    static saveWorkout(workout) {
        const workouts = Storage.getItems('workouts');
        workouts.push(workout);
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    static clearAll() {
        localStorage.removeItem('totalCalories');
        localStorage.removeItem('meats');
        localStorage.removeItem('workouts');
        // localStorage.clear();
    }
}

class App {
    constructor() {
        this.tracker = new CalorieTracker();
       this.#loadEventListeners();
        this.tracker.loadItems();
    }

    #loadEventListeners() {
        document
        .querySelector('#meal-form')
        .addEventListener('submit', this.#newItem.bind(this, 'meal'))
        document
            .querySelector('#workout-form')
            .addEventListener('submit', this.#newItem.bind(this, 'workout'))
        document
            .querySelector('#meal-items')
            .addEventListener('click', this.#removeItem.bind(this, 'meal'));
        document
            .querySelector('#workout-items')
            .addEventListener('click', this.#removeItem.bind(this, 'workout'));
        document
            .querySelector('#filter-meals')
            .addEventListener('keyup', this.#filterItems.bind(this, 'meal'))
        document
            .querySelector('#filter-workouts')
            .addEventListener('keyup', this.#filterItems.bind(this, 'workout'))
        document
            .querySelector('#reset')
            .addEventListener('click', this.#reset.bind(this));
        document
            .querySelector('#limit-form')
            .addEventListener('submit', this.#setLimit.bind(this));
    }

    #newItem(type, e) {
        e.preventDefault();

        const name = document.querySelector(`#${type}-name`)
        const calories = document.querySelector(`#${type}-calories`)

        if (name.value === '' || calories.value === '' || name.value === ' ') {
            alert('Please fill in all fields');
            return;
        }

        type === 'meal'
        ? this.tracker.addMeal(new Meal(name.value, +calories.value))
        : this.tracker.addWorkout(new Workout(name.value, +calories.value));

        name.value = '';
        calories.value = '';
        const collapseItem = document.querySelector(`#collapse-${type}`);
        new bootstrap.Collapse(collapseItem, {
            toggle: true
        });
    }

    #removeItem(type, e) {
        if (e.target.matches('.delete') || e.target.matches('.fa-xmark')) {
            if (confirm('Are you sure?')) {
                const item = e.target.closest('.card');

                type === 'meal'
                ? this.tracker.removeItem(item.dataset.id, 'meal')
                : this.tracker.removeItem(item.dataset.id, 'workout');

                item.remove();
            }
        }
    }

    #filterItems(type, e) {
        const text = e.target.value.toLowerCase();
        document.querySelectorAll(`#${type}-items .card`).forEach(item => {
            const name = item.firstElementChild.firstElementChild.textContent;

            name.toLowerCase().indexOf(text) !== -1
            ? item.style.display = 'block'
            : item.style.display = 'none';
        })
    }

    #reset() {
        this.tracker.reset();
        document.querySelector('#meal-items').innerHTML = '';
        document.querySelector('#workout-items').innerHTML = '';
        document.querySelector('#filter-meals').value = '';
        document.querySelector('#filter-workouts').value = '';
    }

    #setLimit(e) {
        e.preventDefault();
        const limit = document.querySelector('#limit');
        if (limit.value === '') {
            alert('Please add a limit');
            return;
        }

        this.tracker.setLimit(+limit.value);
        limit.value = '';
        const modalEl = document.querySelector('#limit-modal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    }
}

const app = new App()