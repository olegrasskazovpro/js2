"use strict";

let DTO = [
  {
    id: 'name',
    reg: /[\D]\w+/,
    mes: 'Имя латинскими буквами',
  },
  {
    id: 'phone',
    reg: /\+7\(\d{3}\)\d{3}-\d{4}/,
    mes: 'Телефон вида +7(000)000-0000'
  },
  {
    id: 'email',
    reg: /\w+@[a-zA-Z]+?\.[a-zA-Z]{2,6}/,
    allowed: /[^-.@]/, //допустимые символы в емайле
    mes: 'Введите корретный email'
  },
  {
    id: 'text',
    reg: /.+/,
    mes: 'Введите ваше сообщение'
  },
];

/**
 * Родительский конструктор для инпутов
 */
class FieldHandler {
  constructor(id, pattern, errorMessage) {
    this.id = id;
    this.pattern = pattern;
    this.errorMessage = errorMessage;
    this.el = {};
    this.isCheckOk = false
  }

  /**
   * На инпуты вешаем обработчки клика - чтобы по клику в поле оно устанавливалось в начальное положение
   */
  addEventListener() {
    this.el.addEventListener('click', () => this.clearField())
  }

  /**
   * Функция получает элемент по id
   * @param {string} id элемента в коде HTML
   */
  getEl() {
    this.el = document.getElementById(this.id);
  }

  /**
   * Проверяет заполнен ли input и соответствует ли заданному шаблону
   * @returns {boolean} - true, если поле заполнено и прошло проверку по шаблону
   */
  check() {
    if (this.el.value !== '') {
      this.isCheckOk = new RegExp(this.pattern).test(this.el.value)
    } else {
      this.isCheckOk = false
    }
  }

  /**
   * Метод очищает input, делает рамку красной и выводит в плейсхолдере ошибку
   * ИЛИ выделяет зеленым рамку, если все ОК
   */
  changeField() {
    if (!this.isCheckOk) {
      this.el.value = ''; // очистить поле
      this.el.placeholder = this.errorMessage; // написать в плейсхолдере ошибку
      this.el.classList.remove('ok');
      this.el.classList.add('error') // сделать рамку красной
    } else {
      this.el.classList.add('ok') // если проверка поля успешна - сделать рамку зеленой
    }
  }

  /**
   * Если поле содержит ошибку - очищает поле и убирает выделение ошибки
   */
  clearField() {
    if (this.el.classList.contains('error')) {
      this.el.value = ''; // очищаем поле
      this.el.setAttribute('class', '')
    }
  }
}

/**
 * Дочерний класс для проверки поля email
 */
class EmailHandler extends FieldHandler {
  constructor(id, pattern, allowed, errorMessage) {
    super(id, pattern, errorMessage);
    this.allowed = allowed
  }

  /**
   * Проверяет поле емайла не только по шаблону, но и на наличие недопустимых символов
   */
  check() {
    if (this.pattern.test(this.el.value)) { // проверяем, есть ли в поле что-то похожее на емайл
      let nonLiteralsArr = this.el.value.match(/\W/g).join(''); // находим все нелитералы и объединяем их в строку
      this.isCheckOk = !this.allowed.test(nonLiteralsArr); // проверяем email на наличие недопустимых символов
    } else {
      this.isCheckOk = false
    }
  }
}

/**
 * Дочерний класс для кнопки - содержит обработку клика по кнопке
 */
class Init {
  constructor() {
    this.fields = [];
    this.cityList = [];
    this.button = document.getElementById('submit');
  }

  init() {
    // создаем объекты полей и вешаем на них обработчик клика
    for (let i = 0; i < DTO.length; i++) {
      if (DTO[i].id === 'email') {
        this.fields.push(new EmailHandler(DTO[i].id, DTO[i].reg, DTO[i].allowed, DTO[i].mes));
      } else {
        this.fields.push(new FieldHandler(DTO[i].id, DTO[i].reg, DTO[i].mes));
      }
      this.fields[i].getEl();
      this.fields[i].addEventListener('click', () => this.fields[i].clearField());
    }

    this.setCityList(); // получить и записать массив с городами
    this.cityTypeHandler(); // обработка клика по полю выбора города
    this.buttonHandler(); // запускаем обработчкик кнопки
  }

  /**
   * Обрабатывает клик по кнопке и запускает проверку полей
   * Получает новое значение поля и проверяет его
   */
  buttonHandler() {
    this.button.addEventListener('click', () => {
      for (let i = 0; i < this.fields.length; i++) {
        this.fields[i].el.setAttribute('class', '');
        this.fields[i].getEl(); //получаем получаем элемент поля с имеющимся val внутри
        this.fields[i].check(); // проверяем заполнение поля по шаблону
        this.fields[i].changeField() // выводим ошибку или ОК
      }
      event.preventDefault(); // отменяем сработку submit
    })
  }

  /**
   * Получаем список городов и записываем массив в свойство cityList
   */
  setCityList() {
    $(document).ready(() => {
      $.ajax({
        url: 'cityList.json',
        type: 'GET',
        dataType: 'json',
        success: dataList => {
          this.cityList = dataList;
        },
        error: error => {
          console.log(error);
        }
      })
    })
  }

  /**
   * Записываем все города в значения option у datalist на странице HTML
   */
  appendCityList() {
    for (let i = 0; i < this.cityList.length; i++) {
      $('#cityList').append('<option value="' + this.cityList[i] + '">')
      console.log('<option value="' + this.cityList[i] + '">\n');
    }
  }

  /**
   * При наборе 3 символов заполняем datalist > options в HTML, при менее 3 симолов в поле - удаляем options из datalist
   */
  cityTypeHandler() {
    $('#cityField').keyup(() => {
      let val = $('#cityField')[0].value;
      if (val.length === 3 && $('#cityList').html() === '') {
        this.appendCityList();
      } else if (val.length < 3 && $('#cityList').html() !== '') {
        $('#cityList').html('')
      }
    })
  }
}

let init = new Init();
window.onload = () => {
  init.init()
};