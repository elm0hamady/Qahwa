// كام ثانية تُدّي لكل مستوى صعوبة لما يتفتح السؤال.
// عدّل الأرقام دي زي ما انت عايز — القيمة الافتراضية (20) بتتستخدم لو
// ظهرت صعوبة مش موجودة في القائمة أصلًا.
export const TIMER_SECONDS_BY_DIFFICULTY: Record<number, number> = {
  100: 60, // سهل
  300: 60, // متوسط
  500: 60, // صعب
};

export const DEFAULT_TIMER_SECONDS = 20;
