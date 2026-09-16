// كام ثانية تُدّي لكل مستوى صعوبة لما يتفتح السؤال.
// عدّل الأرقام دي زي ما انت عايز — القيمة الافتراضية (20) بتتستخدم لو
// ظهرت صعوبة مش موجودة في القائمة أصلًا.
export const TIMER_SECONDS_BY_DIFFICULTY: Record<number, number> = {
  100: 120, // سهل
  300: 120, // متوسط
  500: 120, // صعب
};

export const DEFAULT_TIMER_SECONDS = 20;
