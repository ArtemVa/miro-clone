module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // Коммиты пишем на английском. Комментарии git (строки с #) сюда не попадают.
        'no-cyrillic': ({ header, body, footer }) => [
          !/[Ѐ-ӿ]/.test([header, body, footer].join('\n')),
          'commit message must be in English',
        ],
      },
    },
  ],
  rules: {
    'no-cyrillic': [2, 'always'],
    'type-enum': [
      2,
      'always',
      [
        'feat', // Новая функциональность
        'fix', // Исправление багов
        'docs', // Изменения в документации
        'style', // Форматирование, отступы и т.д.
        'refactor', // Рефакторинг кода
        'perf', // Улучшение производительности
        'test', // Добавление тестов
        'build', // Изменения в системе сборки
        'ci', // Изменения в CI/CD
        'chore', // Обслуживание кода
        'revert', // Откат изменений
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
